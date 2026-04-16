package com.skybooker.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skybooker.dto.response.DestinationInsightsResponse;
import com.skybooker.dto.response.DestinationInsightsResponse.CurrentEvent;
import com.skybooker.dto.response.DestinationInsightsResponse.DailyTip;
import com.skybooker.dto.response.DestinationInsightsResponse.Experience;
import com.skybooker.dto.response.DestinationInsightsResponse.SafetySnapshot;
import com.skybooker.dto.response.DestinationInsightsResponse.TravelPractical;
import com.skybooker.service.flight.CityDirectory;
import com.skybooker.service.integration.AnthropicClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

/**
 * Serves destination "concierge" insights (safety, events, things to do,
 * daily tips, travel practicals).
 *
 * Two modes — switched by {@code skybooker.integrations.ai.enabled}:
 *   • Stub mode: returns hand-curated data for popular cities, or a
 *     generic template for unknown ones. Fast, deterministic, no keys.
 *   • Live mode: asks Claude to produce a JSON matching our schema,
 *     with prompt caching on the schema/system prompt.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DestinationInsightsService {

    private final AnthropicClient anthropic;
    private final ObjectMapper mapper = new ObjectMapper();

    private static final String SYSTEM_PROMPT = """
            You are SkyBooker's travel concierge. Given a destination city,
            return a single JSON object matching exactly this schema
            (no prose, no markdown, no code fences):

            {
              "tagline": "one evocative sentence, max 90 chars",
              "safety": {
                "level": "LOW|MODERATE|ELEVATED|HIGH",
                "summary": "2 sentences, reassuring but honest",
                "watchouts": ["3-5 short practical warnings"]
              },
              "events": [
                { "title": "", "window": "dates or season", "location": "", "description": "one line" }
              ],
              "mustDo": [
                { "title": "", "category": "culture|food|nature|nightlife|family",
                  "description": "one line", "neighbourhood": "" }
              ],
              "dailyTips": [
                { "icon": "emoji-free single word e.g. 'transport' or 'coffee'",
                  "title": "short imperative", "detail": "one sentence" }
              ],
              "practical": {
                "currency": "", "language": "", "timezone": "",
                "plug": "letter code", "tipping": "one sentence",
                "transportTip": "best way to move around"
              }
            }

            Rules:
            - 3-5 events, 5-6 mustDo, 4-5 dailyTips.
            - Write warmly, for travellers. Focus on what makes the
              destination feel welcoming and safe.
            - Never invent specific dates beyond "season" or "year-round".
            - Output must be valid JSON.
            """;

    @Cacheable(value = "destination-insights", key = "#iata.toUpperCase()")
    public DestinationInsightsResponse getInsights(String iata) {
        String code = iata == null ? "" : iata.toUpperCase(Locale.ROOT);
        CityDirectory.AirportRef airport = CityDirectory.resolve(code)
                .orElseGet(() -> CityDirectory.synthetic(code));

        if (anthropic.isEnabled()) {
            Optional<DestinationInsightsResponse> live = callClaude(airport);
            if (live.isPresent()) return live.get();
            log.info("Claude call failed or empty for {} — falling back to stub", code);
        }

        return stubFor(airport);
    }

    // --------------------------------------------------------------
    // Live path
    // --------------------------------------------------------------

    private Optional<DestinationInsightsResponse> callClaude(CityDirectory.AirportRef airport) {
        String userPrompt = String.format(
                "Destination: %s, %s (airport code %s). Return insights JSON.",
                airport.city(), airport.country(), airport.iata()
        );
        return anthropic.completeJson(SYSTEM_PROMPT, userPrompt)
                .flatMap(text -> parseClaudeJson(text, airport));
    }

    private Optional<DestinationInsightsResponse> parseClaudeJson(String raw, CityDirectory.AirportRef airport) {
        try {
            String cleaned = raw.trim();
            if (cleaned.startsWith("```")) {
                cleaned = cleaned.replaceAll("^```(?:json)?\\s*", "").replaceAll("\\s*```$", "");
            }
            JsonNode node = mapper.readTree(cleaned);
            return Optional.of(new DestinationInsightsResponse(
                    airport.iata(),
                    airport.city(),
                    airport.country(),
                    node.path("tagline").asText(""),
                    readSafety(node.path("safety")),
                    readEvents(node.path("events")),
                    readMustDo(node.path("mustDo")),
                    readTips(node.path("dailyTips")),
                    readPractical(node.path("practical")),
                    "claude",
                    Instant.now()
            ));
        } catch (Exception e) {
            log.warn("Could not parse Claude insights JSON: {}", e.getMessage());
            return Optional.empty();
        }
    }

    private SafetySnapshot readSafety(JsonNode n) {
        List<String> watchouts = new ArrayList<>();
        n.path("watchouts").forEach(x -> watchouts.add(x.asText()));
        return new SafetySnapshot(
                n.path("level").asText("MODERATE"),
                n.path("summary").asText(""),
                watchouts
        );
    }

    private List<CurrentEvent> readEvents(JsonNode arr) {
        List<CurrentEvent> out = new ArrayList<>();
        arr.forEach(n -> out.add(new CurrentEvent(
                n.path("title").asText(""),
                n.path("window").asText(""),
                n.path("location").asText(""),
                n.path("description").asText("")
        )));
        return out;
    }

    private List<Experience> readMustDo(JsonNode arr) {
        List<Experience> out = new ArrayList<>();
        arr.forEach(n -> out.add(new Experience(
                n.path("title").asText(""),
                n.path("category").asText(""),
                n.path("description").asText(""),
                n.path("neighbourhood").asText("")
        )));
        return out;
    }

    private List<DailyTip> readTips(JsonNode arr) {
        List<DailyTip> out = new ArrayList<>();
        arr.forEach(n -> out.add(new DailyTip(
                n.path("icon").asText(""),
                n.path("title").asText(""),
                n.path("detail").asText("")
        )));
        return out;
    }

    private TravelPractical readPractical(JsonNode n) {
        return new TravelPractical(
                n.path("currency").asText(""),
                n.path("language").asText(""),
                n.path("timezone").asText(""),
                n.path("plug").asText(""),
                n.path("tipping").asText(""),
                n.path("transportTip").asText("")
        );
    }

    // --------------------------------------------------------------
    // Stub path — curated cards for popular cities, generic otherwise.
    // --------------------------------------------------------------

    private DestinationInsightsResponse stubFor(CityDirectory.AirportRef airport) {
        String code = airport.iata();
        Map<String, Stub> curated = Map.ofEntries(
                Map.entry("JFK", nyc()), Map.entry("EWR", nyc()), Map.entry("LGA", nyc()),
                Map.entry("CDG", paris()), Map.entry("ORY", paris()),
                Map.entry("NRT", tokyo()), Map.entry("HND", tokyo()),
                Map.entry("LHR", london()), Map.entry("LGW", london()),
                Map.entry("BCN", barcelona()),
                Map.entry("DXB", dubai()),
                Map.entry("IST", istanbul()),
                Map.entry("SIN", singapore())
        );
        Stub stub = curated.getOrDefault(code, generic(airport.city()));
        return new DestinationInsightsResponse(
                airport.iata(),
                airport.city(),
                airport.country(),
                stub.tagline,
                stub.safety,
                stub.events,
                stub.mustDo,
                stub.tips,
                stub.practical,
                "stub",
                Instant.now()
        );
    }

    private record Stub(
            String tagline,
            SafetySnapshot safety,
            List<CurrentEvent> events,
            List<Experience> mustDo,
            List<DailyTip> tips,
            TravelPractical practical
    ) {}

    private Stub nyc() {
        return new Stub(
                "The city that rewards early risers and late walkers alike.",
                new SafetySnapshot("LOW",
                        "Manhattan and most outer-borough tourist areas feel safe day and night. Keep standard city awareness on the subway after midnight.",
                        List.of("Watch bags on crowded subway lines", "Ignore costumed characters in Times Square asking for tips", "Use yellow cabs or Uber rather than unmarked cars")),
                List.of(
                        new CurrentEvent("Tribeca Film Festival", "Early June", "Lower Manhattan", "Ten days of premieres, panels and pop-ups across Tribeca and SoHo."),
                        new CurrentEvent("SummerStage concerts", "June – August", "Central Park", "Free outdoor concerts spanning jazz, indie, Latin and global acts."),
                        new CurrentEvent("US Open", "Late August – early September", "Flushing Meadows", "Grand Slam tennis with the loudest night sessions on the tour.")
                ),
                List.of(
                        new Experience("Walk the High Line at golden hour", "nature", "Former rail line turned linear garden with skyline views over the Hudson.", "Chelsea"),
                        new Experience("Morning bagel + coffee at Russ & Daughters", "food", "Century-old appetising shop — order a lox bagel and eat it on Houston.", "Lower East Side"),
                        new Experience("Jazz night at Smalls", "nightlife", "Tiny basement club; arrive before 9pm for a seat.", "West Village"),
                        new Experience("Metropolitan Museum of Art", "culture", "Plan 3 hours minimum; the Temple of Dendur alone deserves 20 minutes.", "Upper East Side"),
                        new Experience("Ferry to Red Hook", "family", "Skip the crowded Statue ferry — Red Hook's cheap NYC Ferry gives you the same skyline.", "Brooklyn"),
                        new Experience("Late-night ramen at Ippudo", "food", "Ramen that ruined ramen everywhere else; book or queue.", "East Village")
                ),
                List.of(
                        new DailyTip("transport", "Tap your credit card on the subway turnstile", "OMNY beats buying a MetroCard — Apple Pay and contactless cards work directly."),
                        new DailyTip("weather", "Carry a compact umbrella April through June", "Thunderstorms roll in fast; most bodegas sell them for $5 if caught out."),
                        new DailyTip("dining", "Lunch specials are the hidden deal", "Even Michelin-listed spots halve prices at lunch — book the 12:30 slot."),
                        new DailyTip("neighbourhoods", "Cross the East River at least once", "Williamsburg and DUMBO give the skyline views the skyline itself can't.")
                ),
                new TravelPractical("USD", "English", "America/New_York", "A / B",
                        "15–20% on restaurant bills; $1 per drink at bars.",
                        "Subway for distance, walking for anything under 20 blocks.")
        );
    }

    private Stub paris() {
        return new Stub(
                "A city best met on foot, at dusk, without a plan.",
                new SafetySnapshot("LOW",
                        "Central arrondissements are safe at all hours. Petty theft on Métro line 1 and around major monuments is the main concern.",
                        List.of("Keep phones off café tables on terraces", "Avoid the gold-ring scam near Pont Neuf", "Use official taxis from ranks at airports")),
                List.of(
                        new CurrentEvent("Nuit Blanche", "First Saturday of October", "Citywide", "All-night contemporary art across museums, parks and the Métro."),
                        new CurrentEvent("Fête de la Musique", "21 June", "Every street corner", "Free concerts from living rooms to opera house steps."),
                        new CurrentEvent("Roland-Garros", "Late May – early June", "Bois de Boulogne", "Clay-court Grand Slam — cheaper outer-court passes give the best atmosphere.")
                ),
                List.of(
                        new Experience("Pastries at Du Pain et des Idées", "food", "Order the pistachio escargot and eat it on the Canal Saint-Martin.", "10e"),
                        new Experience("Musée de l'Orangerie", "culture", "Skip the Louvre crowds for Monet's Water Lilies in two oval rooms.", "1er"),
                        new Experience("Sunset from Parc de Belleville", "nature", "The view Montmartre tourists miss — locals and wine welcome.", "20e"),
                        new Experience("Natural wine at Le Baron Rouge", "nightlife", "Cheese planks, oysters on Sundays, nobody sits down.", "12e"),
                        new Experience("Morning run along the Seine", "nature", "Car-free quays from Pont Neuf to Pont de Sully before 9am.", "Centre"),
                        new Experience("Bouquinistes book stalls", "culture", "Green boxes along the Seine — haggle gently, pay cash.", "Left Bank")
                ),
                List.of(
                        new DailyTip("transport", "Buy a Navigo Easy card at any Métro station", "One card, top up as you go — cheaper than single tickets from day one."),
                        new DailyTip("dining", "Eat lunch like the French", "The 20€ 'formule' is every bistro's best deal — two courses, wine, coffee."),
                        new DailyTip("culture", "Museums are free first Sunday", "First Sunday of the month — get there 30 min before opening."),
                        new DailyTip("etiquette", "Start every interaction with 'Bonjour'", "Even a quick 'Bonjour, parlez-vous anglais ?' changes the whole exchange.")
                ),
                new TravelPractical("EUR", "French", "Europe/Paris", "C / E",
                        "Service is included; rounding up 1–2€ is kind but optional.",
                        "Métro + walking. Velib bikes are fine but traffic is hectic.")
        );
    }

    private Stub tokyo() {
        return new Stub(
                "The quietest megacity you'll ever visit.",
                new SafetySnapshot("LOW",
                        "Tokyo is statistically one of the safest capitals on earth. Lost wallets frequently come back via koban police boxes.",
                        List.of("Last trains stop around 00:30 — plan returns early", "Avoid touts in Kabukicho offering bars with no prices", "Earthquakes happen; follow locals' lead if one hits")),
                List.of(
                        new CurrentEvent("Cherry blossom season", "Late March – early April", "Ueno, Meguro River, Shinjuku Gyoen", "The city takes a collective week off work to eat under the trees."),
                        new CurrentEvent("Sumida River Fireworks", "Last Saturday of July", "Asakusa", "Tokyo's biggest fireworks night — book a rooftop or accept the crowd."),
                        new CurrentEvent("Tokyo Game Show", "Late September", "Makuhari Messe", "The biggest gaming showcase in Asia, an hour by train from Tokyo.")
                ),
                List.of(
                        new Experience("Tsukiji Outer Market at dawn", "food", "Tamago, uni, tuna sando — all before 9am.", "Tsukiji"),
                        new Experience("teamLab Planets", "culture", "Barefoot digital art; book weeks ahead.", "Toyosu"),
                        new Experience("Shinjuku Golden Gai", "nightlife", "200 tiny bars in a two-block maze; ¥1000 cover is normal.", "Shinjuku"),
                        new Experience("Sunrise at Sensō-ji", "culture", "The temple is open, the crowd isn't, before 7am.", "Asakusa"),
                        new Experience("Shibuya Sky observation deck", "nature", "Open-air rooftop — sunset slots sell out fast.", "Shibuya"),
                        new Experience("Stand-up sushi at Uogashi Nihon-Ichi", "food", "Chef-picked 10-piece set, done in 20 minutes.", "Shibuya")
                ),
                List.of(
                        new DailyTip("transport", "Buy a Suica card the moment you land", "Taps onto every train, bus, vending machine and most convenience stores."),
                        new DailyTip("cash", "Keep ¥10,000 in cash", "Smaller restaurants and shrines are still cash-only."),
                        new DailyTip("etiquette", "Never tip, ever", "It's confusing at best, rude at worst. Good service is assumed."),
                        new DailyTip("neighbourhoods", "Change districts every half-day", "Tokyo rewards constant movement — each neighbourhood reads like a different city.")
                ),
                new TravelPractical("JPY", "Japanese", "Asia/Tokyo", "A / B",
                        "Tipping is not practised — offering it causes polite refusal.",
                        "JR + Metro covers everywhere. Taxis are clean and reliable after last train.")
        );
    }

    private Stub london() {
        return new Stub(
                "A city of villages stitched together by a 150-year-old underground.",
                new SafetySnapshot("LOW",
                        "Central London is safe around the clock. Phone snatching by moped is the noted concern in busy West End streets.",
                        List.of("Hold phones firmly when using them near traffic", "Stand right on Tube escalators", "Contactless pays your fare — don't buy paper tickets")),
                List.of(
                        new CurrentEvent("Notting Hill Carnival", "Late August bank holiday", "Notting Hill", "Europe's biggest street festival — Sunday is family day, Monday is the parade."),
                        new CurrentEvent("Frieze London", "Mid October", "Regent's Park", "Contemporary art fair plus a dozen satellite fairs citywide."),
                        new CurrentEvent("Wimbledon", "Late June – early July", "SW19", "Queue on Day 3 onwards for Centre Court resale tickets at £15.")
                ),
                List.of(
                        new Experience("Borough Market on a weekday", "food", "Weekends are chaos — Thursdays are when chefs shop.", "Southwark"),
                        new Experience("Tate Modern + Millennium Bridge walk", "culture", "Free entry, best skyline view of St Paul's on the way in.", "Bankside"),
                        new Experience("Hampstead Heath swimming ponds", "nature", "Men's, Ladies' and Mixed — open year round for the brave.", "North London"),
                        new Experience("Ronnie Scott's late show", "nightlife", "Jazz basement since 1959; the 11pm set is cheaper and looser.", "Soho"),
                        new Experience("V&A museum at closing time", "culture", "Free, vast, and mostly empty in the last hour.", "South Kensington"),
                        new Experience("Sunday roast in a proper pub", "food", "Book The Camberwell Arms or The Pelican by Wednesday.", "Varies")
                ),
                List.of(
                        new DailyTip("transport", "Tap contactless on buses and Tube", "Caps at £8.10/day in Zones 1–2. Oyster cards aren't necessary."),
                        new DailyTip("weather", "Layers, not umbrellas", "Rain comes and goes hourly — a packable shell beats a brolly."),
                        new DailyTip("dining", "Theatre Day Seats are £15–25", "Turn up at West End box offices at 10am for the day's best seats."),
                        new DailyTip("neighbourhoods", "Cross the river every day", "South London — Peckham, Brixton, Borough — outperforms North for food.")
                ),
                new TravelPractical("GBP", "English", "Europe/London", "G",
                        "10–12.5% often added at restaurants; optional. Round up in cabs.",
                        "Tube for distance, buses for sightseeing (top deck, front row).")
        );
    }

    private Stub barcelona() {
        return new Stub(
                "Modernista architecture, tapas at midnight, sea at arm's reach.",
                new SafetySnapshot("MODERATE",
                        "Barcelona is safe but famously targeted by pickpockets in La Rambla, Barceloneta beach and Metro Line 3.",
                        List.of("Keep bags zipped and in front on La Rambla", "Leave nothing on the sand at Barceloneta", "Use Línea 1 or 5 over 3 when possible")),
                List.of(
                        new CurrentEvent("La Mercè festival", "Late September", "Citywide", "Barcelona's biggest fiesta — human towers, fire runs, free concerts."),
                        new CurrentEvent("Primavera Sound", "Early June", "Parc del Fòrum", "Three days of global indie + electronic headliners by the sea."),
                        new CurrentEvent("Sant Jordi", "23 April", "Every street", "Catalonia's day of books and roses — the whole city reads outdoors.")
                ),
                List.of(
                        new Experience("Sagrada Família at first light", "culture", "Book the 9:00am slot for morning-stained-glass interior.", "Eixample"),
                        new Experience("Vermut and anchovies in Gràcia", "food", "Bodega Quimet & Quimet on Thursdays — standing room only.", "Gràcia"),
                        new Experience("Bunkers del Carmel sunset", "nature", "A 40-minute walk up; the best 360° view in town.", "El Carmel"),
                        new Experience("Flamenco at JazzSí Club", "nightlife", "Gritty, intimate, nothing staged — nightly.", "Raval"),
                        new Experience("Mercat de Santa Caterina", "food", "Locals shop here, not La Boqueria. Same produce, half the price.", "El Born"),
                        new Experience("Morning swim at Nova Icària", "family", "Cleaner than Barceloneta and walkable from the centre.", "Waterfront")
                ),
                List.of(
                        new DailyTip("language", "Learn 'Bon dia'", "Catalan opens more doors than Spanish; 'gràcies' seals it."),
                        new DailyTip("dining", "Nothing opens early", "Lunch starts at 14:00, dinner at 21:00. Resistance is futile."),
                        new DailyTip("transport", "T-casual card, 10 rides", "About €12 and valid on Metro + buses + trams."),
                        new DailyTip("siesta", "Shops close 14:00–17:00", "Match the rhythm — rest, beach, dinner.")
                ),
                new TravelPractical("EUR", "Catalan / Spanish", "Europe/Madrid", "C / F",
                        "Round up is plenty; tip service only if exceptional.",
                        "Metro + walking. Bike-sharing Bicing is for residents only.")
        );
    }

    private Stub dubai() {
        return new Stub(
                "Desert edge, glass skyline, and the most reliable sunshine in the region.",
                new SafetySnapshot("LOW",
                        "Dubai's crime rate is among the world's lowest. The main risks are heat-related and driving on fast highways.",
                        List.of("Public displays of affection are unwelcome", "Swimwear only on beaches and hotel pools", "Do not photograph people without consent, especially women")),
                List.of(
                        new CurrentEvent("Dubai Shopping Festival", "December – January", "Citywide malls + Global Village", "Month-long sales, fireworks and concerts."),
                        new CurrentEvent("Art Dubai", "Early March", "Madinat Jumeirah", "Middle East's leading contemporary art fair."),
                        new CurrentEvent("Dubai Food Festival", "Late April – early May", "Citywide", "City-wide restaurant offers and pop-ups.")
                ),
                List.of(
                        new Experience("Sunrise at the Burj Khalifa observation deck", "culture", "Levels 124/125 open 8:30am — half the daytime queue.", "Downtown"),
                        new Experience("Abra ride across the Creek", "family", "1 AED crossing from Bur Dubai to Deira; the original Dubai.", "Deira"),
                        new Experience("Desert dune drive at dusk", "nature", "Book Platinum Heritage for the quieter conservation-area route.", "Al Marmoom"),
                        new Experience("Gold and spice souks", "culture", "Deira's maze — haggle for saffron, not for gold.", "Deira"),
                        new Experience("Brunch at Bait Maryam", "food", "Levantine home cooking, not a hotel buffet.", "JLT"),
                        new Experience("Kite Beach Friday morning", "family", "Sand bikes, paddleboards, and the skyline as backdrop.", "Umm Suqeim")
                ),
                List.of(
                        new DailyTip("weather", "Outdoor sightseeing before 10am", "From April to October the heat is genuinely dangerous midday."),
                        new DailyTip("transport", "Get a Nol card", "Works on Metro, trams, buses and even the monorail to the Palm."),
                        new DailyTip("etiquette", "Friday is the holy day", "Malls open late; some government services don't open at all."),
                        new DailyTip("money", "Alcohol is licensed, not banned", "Sold in hotel restaurants and bars; tourists don't need a permit.")
                ),
                new TravelPractical("AED", "Arabic / English", "Asia/Dubai", "G",
                        "10% is often added; additional 10% is generous.",
                        "Metro along Sheikh Zayed Road, Careem or Uber everywhere else.")
        );
    }

    private Stub istanbul() {
        return new Stub(
                "Two continents, one bridge, and tea at every corner.",
                new SafetySnapshot("MODERATE",
                        "Tourist areas are safe; avoid political demonstrations and keep receipts from taxis to check routes.",
                        List.of("Agree a taxi price or insist on the meter", "Touts outside the Blue Mosque lead to overpriced carpet shops", "Queue patiently at ferries — pushing is normal, stepping aside is too")),
                List.of(
                        new CurrentEvent("Istanbul Music Festival", "Early June", "Various venues", "Three weeks of classical concerts in historic palaces."),
                        new CurrentEvent("Istanbul Biennial", "September – November, odd years", "Across Beyoğlu + the Bosphorus", "Contemporary art spread across 15+ venues, many free."),
                        new CurrentEvent("Tulip Festival", "April", "Emirgan Park", "Over three million tulips — the flower's true historical home.")
                ),
                List.of(
                        new Experience("Sunrise at the Süleymaniye Mosque", "culture", "Quieter than the Blue Mosque, arguably more beautiful.", "Fatih"),
                        new Experience("Bosphorus public ferry", "nature", "Don't pay for a tour — the Şehir Hatları commuter ferry costs a euro.", "Eminönü to Üsküdar"),
                        new Experience("Kadıköy food walk", "food", "Cross to the Asian side for the best modern Turkish cooking.", "Kadıköy"),
                        new Experience("Basilica Cistern", "culture", "Recently renovated — atmospheric lighting, Medusa heads intact.", "Sultanahmet"),
                        new Experience("Tea at Pierre Loti hill", "nature", "Tram up, walk down through Eyüp cemetery.", "Eyüp"),
                        new Experience("Meze dinner in Cihangir", "food", "Çukur Meyhane with rakı — order six meze, share everything.", "Beyoğlu")
                ),
                List.of(
                        new DailyTip("transport", "Istanbulkart", "One card, all transport — buy at any kiosk labelled 'İBB'."),
                        new DailyTip("money", "Exchange at Grand Bazaar's north gates", "Rates are better than hotels or airports — shop three stalls."),
                        new DailyTip("etiquette", "Dress modestly for mosques", "Shoulders and knees covered; women bring a scarf, shoes off at the door."),
                        new DailyTip("dining", "Breakfast is the main event", "Book a 'kahvaltı' spread in Beşiktaş — expect two hours.")
                ),
                new TravelPractical("TRY", "Turkish", "Europe/Istanbul", "C / F",
                        "10% at restaurants if service isn't already added.",
                        "Tram + ferry + funicular covers the centre; Uber is reliable for hills.")
        );
    }

    private Stub singapore() {
        return new Stub(
                "The tropical city-state engineered for strangers.",
                new SafetySnapshot("LOW",
                        "Among the safest cities on earth at any hour. The main risks are heatstroke and sudden thunderstorms.",
                        List.of("Don't jaywalk — it's fined and enforced", "Chewing gum is banned in public transport", "Drug laws are severe, including transit")),
                List.of(
                        new CurrentEvent("F1 Singapore Grand Prix", "Late September – early October", "Marina Bay street circuit", "Night race through downtown; concerts bundled with race tickets."),
                        new CurrentEvent("Chinese New Year", "Late January – February", "Chinatown", "Two weeks of lantern streets, lion dances and reunion dinners."),
                        new CurrentEvent("Singapore Food Festival", "Late August", "Citywide", "Hawker stalls, chef pop-ups and heritage tastings.")
                ),
                List.of(
                        new Experience("Hawker dinner at Maxwell", "food", "Tian Tian chicken rice, then Zhen Zhen for porridge.", "Chinatown"),
                        new Experience("Gardens by the Bay at 7:45pm", "nature", "Free Supertree light show nightly at 19:45 and 20:45.", "Marina Bay"),
                        new Experience("Night ride up Mount Faber", "family", "Cable car over the harbour to Sentosa and back.", "Harbourfront"),
                        new Experience("Tiong Bahru district walk", "culture", "Bauhaus housing, indie bookshops, brunch.", "Tiong Bahru"),
                        new Experience("Singapore Zoo's Night Safari", "family", "The original night zoo; arrive at 19:15 for the tram.", "Mandai"),
                        new Experience("Peranakan lunch at Candlenut", "food", "One-Michelin nonya cuisine — book two weeks ahead.", "Dempsey Hill")
                ),
                List.of(
                        new DailyTip("transport", "EZ-Link card or contactless", "Both work on MRT and buses. A ride is under SGD 2."),
                        new DailyTip("weather", "Pack a light rain shell", "Tropical storms roll through in 20 minutes most afternoons."),
                        new DailyTip("dining", "Hawker centres beat restaurants", "Some carry Michelin stars; dinner for SGD 6 is normal."),
                        new DailyTip("etiquette", "Queue, always, everywhere", "Singaporeans queue for everything; joining the end is expected.")
                ),
                new TravelPractical("SGD", "English / Mandarin / Malay / Tamil", "Asia/Singapore", "G",
                        "Service is usually included; extra is unusual.",
                        "MRT reaches almost everywhere; taxis are metered and cheap by global standards.")
        );
    }

    private Stub generic(String city) {
        return new Stub(
                "Bring curiosity — the details make themselves known.",
                new SafetySnapshot("MODERATE",
                        "Standard urban travel caution applies. Check your government's travel advisory before departure.",
                        List.of("Use official taxi apps or airport ranks", "Keep copies of your passport separate from the original", "Notify your bank of travel dates to avoid blocked cards")),
                List.of(
                        new CurrentEvent("Check local listings", "Year-round", city, "Search for seasonal festivals, food markets and concerts in the month of your visit.")
                ),
                List.of(
                        new Experience("Start with a walking tour", "culture", "Most cities have pay-what-you-like walking tours — best orientation on day one.", "Old town"),
                        new Experience("Eat where locals queue", "food", "Longest line at lunch beats any guidebook recommendation.", "Varies"),
                        new Experience("Public transport ride-along", "family", "Pick the longest tram or metro line — easiest city overview.", "Varies"),
                        new Experience("Visit the central market", "food", "Every city's identity is in its market: produce, meals, language.", "Varies"),
                        new Experience("Sunset from a high vantage", "nature", "Rooftop bar, church tower, hilltop park — pick one.", "Varies")
                ),
                List.of(
                        new DailyTip("payment", "Carry a little local cash", "Small markets, taxis and tipping often want cash even in card-first cities."),
                        new DailyTip("language", "Learn four words", "'Hello', 'please', 'thank you', 'sorry' — it visibly changes interactions."),
                        new DailyTip("transport", "Download the offline map", "Google Maps offline + the local transit app is usually enough."),
                        new DailyTip("safety", "Share your itinerary", "Send your accommodation and flight details to someone at home.")
                ),
                new TravelPractical("Local currency", "Local language", "Local timezone", "Check before travel",
                        "Follow local norms — 10% is a safe default where tipping applies.",
                        "Public transport first, rideshare second, car hire only if the city demands it.")
        );
    }
}
