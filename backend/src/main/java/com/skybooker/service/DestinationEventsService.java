package com.skybooker.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skybooker.dto.response.DestinationEventsResponse;
import com.skybooker.dto.response.DestinationEventsResponse.Event;
import com.skybooker.dto.response.DestinationEventsResponse.Image;
import com.skybooker.service.flight.CityDirectory;
import com.skybooker.service.integration.AnthropicClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.Month;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

/**
 * Rich "what's on" events for a destination: current and upcoming
 * festivals, concerts, races, carnivals, etc. Every event carries
 * an image, dates, times and a venue so the frontend can render
 * a magazine-style hero section.
 *
 * Behaves like {@link DestinationInsightsService}: Claude in live
 * mode, curated stubs otherwise, with Redis cache.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DestinationEventsService {

    private final AnthropicClient anthropic;
    private final ObjectMapper mapper = new ObjectMapper();

    private static final String SYSTEM_PROMPT = """
            You are SkyBooker's events editor. For the given destination,
            return a single JSON object matching exactly this schema
            (no prose, no markdown, no code fences):

            {
              "heroImage": { "url": "", "alt": "", "credit": "" },
              "events": [
                {
                  "id": "slug-case-id",
                  "title": "",
                  "category": "festival|music|sports|cultural|food|seasonal",
                  "startDate": "YYYY-MM-DD",
                  "endDate": "YYYY-MM-DD",
                  "startTime": "HH:mm or empty",
                  "venue": "",
                  "neighbourhood": "",
                  "description": "2-sentence description",
                  "tagline": "5-8 word hook",
                  "image": { "url": "", "alt": "", "credit": "" },
                  "ticketUrl": "",
                  "priceFromEur": 0,
                  "featured": true
                }
              ]
            }

            Rules:
            - 5 to 7 events happening in the next 6 months from now.
            - First event MUST have featured=true; others should be false.
            - Dates must be ISO-8601 (YYYY-MM-DD). Leave startTime as "" for multi-day events.
            - Only include image URLs from images.unsplash.com that you know exist.
            - Prefer well-known annual events (carnivals, music fests, grand slams, etc.).
            - Output must be valid JSON.
            """;

    @Cacheable(value = "destination-events", key = "#iata.toUpperCase()")
    public DestinationEventsResponse getEvents(String iata) {
        String code = iata == null ? "" : iata.toUpperCase(Locale.ROOT);
        CityDirectory.AirportRef airport = CityDirectory.resolve(code)
                .orElseGet(() -> CityDirectory.synthetic(code));

        if (anthropic.isEnabled()) {
            Optional<DestinationEventsResponse> live = callClaude(airport);
            if (live.isPresent()) return live.get();
            log.info("Claude events call failed for {} — falling back to stub", code);
        }
        return stubFor(airport);
    }

    // --------------------------------------------------------------
    // Live path
    // --------------------------------------------------------------

    private Optional<DestinationEventsResponse> callClaude(CityDirectory.AirportRef airport) {
        String userPrompt = String.format(
                "Destination: %s, %s (airport code %s). Today's date: %s. Return events JSON.",
                airport.city(), airport.country(), airport.iata(), LocalDate.now()
        );
        return anthropic.completeJson(SYSTEM_PROMPT, userPrompt)
                .flatMap(text -> parseClaudeJson(text, airport));
    }

    private Optional<DestinationEventsResponse> parseClaudeJson(String raw, CityDirectory.AirportRef airport) {
        try {
            String cleaned = raw.trim();
            if (cleaned.startsWith("```")) {
                cleaned = cleaned.replaceAll("^```(?:json)?\\s*", "").replaceAll("\\s*```$", "");
            }
            JsonNode node = mapper.readTree(cleaned);
            return Optional.of(new DestinationEventsResponse(
                    airport.iata(),
                    airport.city(),
                    airport.country(),
                    readImage(node.path("heroImage")),
                    readEvents(node.path("events")),
                    "claude",
                    Instant.now()
            ));
        } catch (Exception e) {
            log.warn("Could not parse Claude events JSON: {}", e.getMessage());
            return Optional.empty();
        }
    }

    private Image readImage(JsonNode n) {
        if (n == null || n.isMissingNode() || n.isNull()) return null;
        String url = n.path("url").asText("");
        if (url.isBlank()) return null;
        return new Image(url, n.path("alt").asText(""), n.path("credit").asText(""));
    }

    private List<Event> readEvents(JsonNode arr) {
        List<Event> out = new ArrayList<>();
        arr.forEach(n -> {
            try {
                out.add(new Event(
                        n.path("id").asText(""),
                        n.path("title").asText(""),
                        n.path("category").asText("cultural"),
                        parseDate(n.path("startDate").asText(null)),
                        parseDate(n.path("endDate").asText(null)),
                        n.path("startTime").asText(""),
                        n.path("venue").asText(""),
                        n.path("neighbourhood").asText(""),
                        n.path("description").asText(""),
                        n.path("tagline").asText(""),
                        readImage(n.path("image")),
                        emptyToNull(n.path("ticketUrl").asText("")),
                        n.path("priceFromEur").isNumber()
                                ? BigDecimal.valueOf(n.path("priceFromEur").asDouble())
                                : null,
                        n.path("featured").asBoolean(false)
                ));
            } catch (Exception e) {
                log.debug("Skipping malformed event entry: {}", e.getMessage());
            }
        });
        return out;
    }

    private LocalDate parseDate(String s) {
        if (s == null || s.isBlank()) return null;
        try { return LocalDate.parse(s); } catch (Exception e) { return null; }
    }

    private String emptyToNull(String s) { return s == null || s.isBlank() ? null : s; }

    // --------------------------------------------------------------
    // Stub path — curated events with real imagery.
    // --------------------------------------------------------------

    private DestinationEventsResponse stubFor(CityDirectory.AirportRef airport) {
        String code = airport.iata();
        Map<String, StubBuilder> curated = Map.ofEntries(
                Map.entry("CDG", () -> paris(airport)),
                Map.entry("ORY", () -> paris(airport)),
                Map.entry("JFK", () -> nyc(airport)),
                Map.entry("EWR", () -> nyc(airport)),
                Map.entry("LGA", () -> nyc(airport)),
                Map.entry("NRT", () -> tokyo(airport)),
                Map.entry("HND", () -> tokyo(airport)),
                Map.entry("LHR", () -> london(airport)),
                Map.entry("LGW", () -> london(airport)),
                Map.entry("BCN", () -> barcelona(airport)),
                Map.entry("DXB", () -> dubai(airport)),
                Map.entry("IST", () -> istanbul(airport)),
                Map.entry("SIN", () -> singapore(airport)),
                Map.entry("VCE", () -> venice(airport)),
                Map.entry("GIG", () -> rio(airport))
        );
        StubBuilder builder = curated.get(code);
        if (builder == null) {
            return generic(airport);
        }
        return builder.build();
    }

    @FunctionalInterface
    private interface StubBuilder { DestinationEventsResponse build(); }

    private DestinationEventsResponse make(
            CityDirectory.AirportRef airport,
            String heroUrl,
            String heroAlt,
            String heroCredit,
            List<Event> events
    ) {
        return new DestinationEventsResponse(
                airport.iata(),
                airport.city(),
                airport.country(),
                new Image(heroUrl, heroAlt, heroCredit),
                events,
                "stub",
                Instant.now()
        );
    }

    /** Pick a year >= today's year so stub events don't look stale. */
    private int upcomingYear(Month month, int day) {
        LocalDate now = LocalDate.now();
        LocalDate thisYear = LocalDate.of(now.getYear(), month, day);
        return thisYear.isBefore(now) ? now.getYear() + 1 : now.getYear();
    }

    private LocalDate dateFor(Month month, int day) {
        return LocalDate.of(upcomingYear(month, day), month, day);
    }

    // ------------ City stubs -----------------------------------------

    private DestinationEventsResponse paris(CityDirectory.AirportRef a) {
        return make(a,
                "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600&q=80&auto=format&fit=crop",
                "The Eiffel Tower at dusk",
                "Unsplash · Chris Karidis",
                List.of(
                        new Event(
                                "roland-garros",
                                "Roland-Garros",
                                "sports",
                                dateFor(Month.MAY, 24), dateFor(Month.JUNE, 8),
                                "11:00",
                                "Stade Roland-Garros",
                                "16ᵉ arrondissement",
                                "Clay-court Grand Slam with two weeks of tennis on ochre dust. Outer-court tickets start under 40€ and often deliver the best atmosphere.",
                                "Tennis on clay, nowhere else like it",
                                new Image(
                                        "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=1200&q=80&auto=format&fit=crop",
                                        "Clay tennis court",
                                        "Unsplash"
                                ),
                                "https://www.rolandgarros.com",
                                BigDecimal.valueOf(35), true
                        ),
                        new Event(
                                "fete-de-la-musique",
                                "Fête de la Musique",
                                "music",
                                dateFor(Month.JUNE, 21), dateFor(Month.JUNE, 21),
                                "18:00",
                                "Every street corner",
                                "Citywide",
                                "Free concerts spill out of living rooms, brasseries and the Palais-Royal from dusk until the last Métro.",
                                "The city plays, for one night only",
                                new Image(
                                        "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200&q=80&auto=format&fit=crop",
                                        "Crowd at a music festival",
                                        "Unsplash"
                                ),
                                null, BigDecimal.ZERO, false
                        ),
                        new Event(
                                "tour-de-france-finale",
                                "Tour de France · Champs-Élysées finale",
                                "sports",
                                dateFor(Month.JULY, 27), dateFor(Month.JULY, 27),
                                "16:00",
                                "Avenue des Champs-Élysées",
                                "8ᵉ arrondissement",
                                "The peloton's sprint under the Arc de Triomphe after three weeks and 3 400 km. Free to watch, arrive by noon for Saint-Germain.",
                                "The peloton's last sprint, under the Arc",
                                new Image(
                                        "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=1200&q=80&auto=format&fit=crop",
                                        "Cyclists racing",
                                        "Unsplash"
                                ),
                                null, BigDecimal.ZERO, false
                        ),
                        new Event(
                                "nuit-blanche",
                                "Nuit Blanche",
                                "cultural",
                                dateFor(Month.OCTOBER, 4), dateFor(Month.OCTOBER, 5),
                                "19:00",
                                "Across museums, parks, Métro stations",
                                "Citywide",
                                "Free contemporary art from sundown to sunrise. Installations pop up in the most unexpected corners of the city.",
                                "Art until dawn, for free",
                                new Image(
                                        "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=1200&q=80&auto=format&fit=crop",
                                        "Contemporary art installation",
                                        "Unsplash"
                                ),
                                null, BigDecimal.ZERO, false
                        ),
                        new Event(
                                "marches-de-noel-paris",
                                "Christmas markets",
                                "seasonal",
                                dateFor(Month.NOVEMBER, 21), dateFor(Month.DECEMBER, 26),
                                "11:00",
                                "Tuileries, Notre-Dame, La Défense",
                                "Multiple neighbourhoods",
                                "Chalets, vin chaud, marrons chauds — five weeks of holiday stalls. Tuileries is the biggest, Notre-Dame the most intimate.",
                                "Mulled wine under fairy lights",
                                new Image(
                                        "https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=1200&q=80&auto=format&fit=crop",
                                        "Christmas market lights",
                                        "Unsplash"
                                ),
                                null, null, false
                        )
                )
        );
    }

    private DestinationEventsResponse nyc(CityDirectory.AirportRef a) {
        return make(a,
                "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1600&q=80&auto=format&fit=crop",
                "Manhattan skyline from Brooklyn Bridge",
                "Unsplash · Luca Bravo",
                List.of(
                        new Event(
                                "tribeca-film-festival",
                                "Tribeca Film Festival",
                                "cultural",
                                dateFor(Month.JUNE, 4), dateFor(Month.JUNE, 15),
                                "19:00",
                                "Multiple venues across Tribeca & SoHo",
                                "Lower Manhattan",
                                "Twelve days of premieres, panels and pop-ups founded by Robert De Niro after 9/11. Day passes give access to two films and a panel.",
                                "Premieres, panels, pop-ups — a dozen days",
                                new Image(
                                        "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&q=80&auto=format&fit=crop",
                                        "Cinema seats",
                                        "Unsplash"
                                ),
                                "https://tribecafilm.com",
                                BigDecimal.valueOf(25), true
                        ),
                        new Event(
                                "summerstage",
                                "SummerStage in Central Park",
                                "music",
                                dateFor(Month.JUNE, 1), dateFor(Month.AUGUST, 30),
                                "19:00",
                                "Rumsey Playfield",
                                "Central Park",
                                "Free outdoor concerts spanning jazz, indie, Latin and global acts. Most are free; arrive by 17:30 to claim a lawn spot.",
                                "Free concerts, lawn seating",
                                new Image(
                                        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&q=80&auto=format&fit=crop",
                                        "Outdoor concert",
                                        "Unsplash"
                                ),
                                "https://cityparksfoundation.org", BigDecimal.ZERO, false
                        ),
                        new Event(
                                "us-open",
                                "US Open",
                                "sports",
                                dateFor(Month.AUGUST, 25), dateFor(Month.SEPTEMBER, 7),
                                "12:00",
                                "Arthur Ashe Stadium",
                                "Flushing Meadows, Queens",
                                "Grand Slam tennis with the loudest night sessions on the tour. Ground passes give you access to 16 courts for under $100.",
                                "Grand Slam nights, louder than most",
                                new Image(
                                        "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1200&q=80&auto=format&fit=crop",
                                        "Tennis stadium",
                                        "Unsplash"
                                ),
                                "https://usopen.org",
                                BigDecimal.valueOf(80), false
                        ),
                        new Event(
                                "macy-thanksgiving",
                                "Macy's Thanksgiving Day Parade",
                                "seasonal",
                                dateFor(Month.NOVEMBER, 27), dateFor(Month.NOVEMBER, 27),
                                "09:00",
                                "From 77th & Central Park West to Herald Square",
                                "Midtown",
                                "Giant balloons, marching bands, Broadway numbers — the unofficial start of the holiday season, watched by 50M Americans on TV.",
                                "Balloons the size of buildings",
                                new Image(
                                        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80&auto=format&fit=crop",
                                        "NYC streets",
                                        "Unsplash"
                                ),
                                null, BigDecimal.ZERO, false
                        ),
                        new Event(
                                "times-square-nye",
                                "New Year's Eve · Times Square",
                                "seasonal",
                                dateFor(Month.DECEMBER, 31), dateFor(Month.JANUARY, 1),
                                "18:00",
                                "Times Square",
                                "Midtown",
                                "The ball drops at midnight. If you want a spot, arrive by 15:00 — and don't expect to leave for a bathroom break.",
                                "The ball drops at midnight",
                                new Image(
                                        "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=1200&q=80&auto=format&fit=crop",
                                        "Fireworks over city",
                                        "Unsplash"
                                ),
                                null, BigDecimal.ZERO, false
                        )
                )
        );
    }

    private DestinationEventsResponse tokyo(CityDirectory.AirportRef a) {
        return make(a,
                "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1600&q=80&auto=format&fit=crop",
                "Shibuya crossing at night",
                "Unsplash · Louie Martinez",
                List.of(
                        new Event(
                                "hanami",
                                "Hanami · Cherry blossom viewing",
                                "seasonal",
                                dateFor(Month.MARCH, 25), dateFor(Month.APRIL, 10),
                                "",
                                "Ueno Park, Meguro River, Shinjuku Gyoen",
                                "Multiple neighbourhoods",
                                "Two weeks when the entire city takes its lunch under the trees. Meguro River at night is lit pink by paper lanterns.",
                                "A city eats lunch under the trees",
                                new Image(
                                        "https://images.unsplash.com/photo-1522383225653-ed111181a951?w=1200&q=80&auto=format&fit=crop",
                                        "Cherry blossoms",
                                        "Unsplash"
                                ),
                                null, BigDecimal.ZERO, true
                        ),
                        new Event(
                                "kanda-matsuri",
                                "Kanda Matsuri",
                                "festival",
                                dateFor(Month.MAY, 9), dateFor(Month.MAY, 15),
                                "08:00",
                                "Kanda-myōjin Shrine",
                                "Chiyoda",
                                "One of Tokyo's three great Shinto festivals — mikoshi portable shrines paraded through Akihabara and Nihonbashi in odd years.",
                                "Portable shrines through Akihabara",
                                new Image(
                                        "https://images.unsplash.com/photo-1528164344705-47542687000d?w=1200&q=80&auto=format&fit=crop",
                                        "Japanese festival",
                                        "Unsplash"
                                ),
                                null, BigDecimal.ZERO, false
                        ),
                        new Event(
                                "sumida-fireworks",
                                "Sumida River Fireworks",
                                "seasonal",
                                dateFor(Month.JULY, 26), dateFor(Month.JULY, 26),
                                "19:00",
                                "Sumida River",
                                "Asakusa",
                                "Tokyo's biggest fireworks night — 20 000 fireworks, 900 000 spectators. Book a rooftop months in advance or accept the crowd.",
                                "20 000 fireworks over the river",
                                new Image(
                                        "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=1200&q=80&auto=format&fit=crop",
                                        "Fireworks",
                                        "Unsplash"
                                ),
                                null, BigDecimal.ZERO, false
                        ),
                        new Event(
                                "tokyo-game-show",
                                "Tokyo Game Show",
                                "cultural",
                                dateFor(Month.SEPTEMBER, 25), dateFor(Month.SEPTEMBER, 28),
                                "10:00",
                                "Makuhari Messe",
                                "Chiba (1h by train)",
                                "The biggest gaming showcase in Asia. First two days are press/industry only; the weekend is open to the public.",
                                "Asia's biggest gaming stage",
                                new Image(
                                        "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&q=80&auto=format&fit=crop",
                                        "Gaming convention",
                                        "Unsplash"
                                ),
                                "https://tgs.nikkeibp.co.jp",
                                BigDecimal.valueOf(20), false
                        ),
                        new Event(
                                "tokyo-illumination",
                                "Winter illuminations",
                                "seasonal",
                                dateFor(Month.NOVEMBER, 10), dateFor(Month.FEBRUARY, 14),
                                "17:00",
                                "Roppongi Hills, Marunouchi, Shibuya",
                                "Multiple",
                                "Eight million LED lights turn the city into a winter theatre. Marunouchi's 1.2 km tree-lined avenue is the most cinematic.",
                                "Eight million LEDs, one long avenue",
                                new Image(
                                        "https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?w=1200&q=80&auto=format&fit=crop",
                                        "Winter lights",
                                        "Unsplash"
                                ),
                                null, BigDecimal.ZERO, false
                        )
                )
        );
    }

    private DestinationEventsResponse london(CityDirectory.AirportRef a) {
        return make(a,
                "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1600&q=80&auto=format&fit=crop",
                "Westminster and Big Ben at dusk",
                "Unsplash",
                List.of(
                        new Event(
                                "wimbledon",
                                "Wimbledon Championships",
                                "sports",
                                dateFor(Month.JUNE, 29), dateFor(Month.JULY, 12),
                                "11:00",
                                "All England Lawn Tennis Club",
                                "SW19",
                                "The oldest Grand Slam. Queue from Day 3 for Centre Court resale tickets at £15 — the great democracy of tennis.",
                                "Strawberries, cream, green grass",
                                new Image(
                                        "https://images.unsplash.com/photo-1542144582-1ba00456b5e3?w=1200&q=80&auto=format&fit=crop",
                                        "Tennis",
                                        "Unsplash"
                                ),
                                "https://wimbledon.com",
                                BigDecimal.valueOf(15), true
                        ),
                        new Event(
                                "notting-hill-carnival",
                                "Notting Hill Carnival",
                                "festival",
                                dateFor(Month.AUGUST, 30), dateFor(Month.AUGUST, 31),
                                "10:00",
                                "Notting Hill streets",
                                "West London",
                                "Europe's biggest street festival. Sunday is family day; Monday is the main parade with two million on the streets.",
                                "Europe's biggest street carnival",
                                new Image(
                                        "https://images.unsplash.com/photo-1541417904950-b855846fe074?w=1200&q=80&auto=format&fit=crop",
                                        "Carnival dancers",
                                        "Unsplash"
                                ),
                                null, BigDecimal.ZERO, false
                        ),
                        new Event(
                                "frieze-london",
                                "Frieze London",
                                "cultural",
                                dateFor(Month.OCTOBER, 15), dateFor(Month.OCTOBER, 19),
                                "11:00",
                                "Regent's Park",
                                "Marylebone",
                                "Contemporary art fair plus a dozen satellite fairs citywide. Tickets include admission to Frieze Masters next door.",
                                "Contemporary art, under canvas",
                                new Image(
                                        "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=1200&q=80&auto=format&fit=crop",
                                        "Art fair",
                                        "Unsplash"
                                ),
                                "https://frieze.com",
                                BigDecimal.valueOf(60), false
                        ),
                        new Event(
                                "guy-fawkes",
                                "Guy Fawkes Night fireworks",
                                "seasonal",
                                dateFor(Month.NOVEMBER, 5), dateFor(Month.NOVEMBER, 8),
                                "19:00",
                                "Battersea Park, Alexandra Palace, Crystal Palace",
                                "Multiple",
                                "Three nights of fireworks across the city to mark 1605's foiled gunpowder plot. Alexandra Palace has the best skyline view.",
                                "Fireworks for a foiled plot",
                                new Image(
                                        "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=1200&q=80&auto=format&fit=crop",
                                        "Fireworks",
                                        "Unsplash"
                                ),
                                null, BigDecimal.valueOf(15), false
                        ),
                        new Event(
                                "winter-wonderland",
                                "Hyde Park Winter Wonderland",
                                "seasonal",
                                dateFor(Month.NOVEMBER, 21), dateFor(Month.JANUARY, 5),
                                "10:00",
                                "Hyde Park",
                                "Mayfair",
                                "Ice rink, Bavarian village, roller coasters, ice sculptures and more mulled wine than seems sensible. Free entry, book on weekends.",
                                "An ice rink, a Bavarian village",
                                new Image(
                                        "https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=1200&q=80&auto=format&fit=crop",
                                        "Winter market",
                                        "Unsplash"
                                ),
                                "https://hydeparkwinterwonderland.com",
                                BigDecimal.ZERO, false
                        )
                )
        );
    }

    private DestinationEventsResponse barcelona(CityDirectory.AirportRef a) {
        return make(a,
                "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1600&q=80&auto=format&fit=crop",
                "La Sagrada Família façade",
                "Unsplash",
                List.of(
                        new Event(
                                "sant-jordi",
                                "Sant Jordi · Day of books and roses",
                                "cultural",
                                dateFor(Month.APRIL, 23), dateFor(Month.APRIL, 23),
                                "09:00",
                                "Passeig de Gràcia, Las Ramblas",
                                "Citywide",
                                "Catalonia's day of love. Men give roses, women give books — the whole city reads outdoors while street stalls sell both.",
                                "A city trades books and roses",
                                new Image(
                                        "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80&auto=format&fit=crop",
                                        "Roses",
                                        "Unsplash"
                                ),
                                null, BigDecimal.ZERO, true
                        ),
                        new Event(
                                "primavera-sound",
                                "Primavera Sound",
                                "music",
                                dateFor(Month.JUNE, 4), dateFor(Month.JUNE, 6),
                                "17:00",
                                "Parc del Fòrum",
                                "Sant Martí",
                                "Three days of global indie + electronic headliners by the Mediterranean. Sets run until 05:00 — plan your sleep elsewhere.",
                                "Three nights by the Mediterranean",
                                new Image(
                                        "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200&q=80&auto=format&fit=crop",
                                        "Music festival",
                                        "Unsplash"
                                ),
                                "https://primaverasound.com",
                                BigDecimal.valueOf(295), false
                        ),
                        new Event(
                                "la-merce",
                                "La Mercè",
                                "festival",
                                dateFor(Month.SEPTEMBER, 21), dateFor(Month.SEPTEMBER, 24),
                                "10:00",
                                "Plaça Sant Jaume and beyond",
                                "Gothic Quarter",
                                "Barcelona's biggest fiesta. Human towers (castells), fire runs (correfocs), giants, dragons and the piromusical finale over the beach.",
                                "Human towers and dragons",
                                new Image(
                                        "https://images.unsplash.com/photo-1528189574-44b8bc3dca78?w=1200&q=80&auto=format&fit=crop",
                                        "Catalonia festival",
                                        "Unsplash"
                                ),
                                null, BigDecimal.ZERO, false
                        ),
                        new Event(
                                "mobile-world-congress",
                                "Mobile World Congress",
                                "cultural",
                                dateFor(Month.FEBRUARY, 24), dateFor(Month.FEBRUARY, 27),
                                "09:00",
                                "Fira Gran Via",
                                "L'Hospitalet",
                                "The world's largest mobile industry event — 100 000 delegates and every phone maker's most polished keynote.",
                                "The phone world's biggest week",
                                new Image(
                                        "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&q=80&auto=format&fit=crop",
                                        "Tech conference",
                                        "Unsplash"
                                ),
                                "https://mwcbarcelona.com",
                                BigDecimal.valueOf(999), false
                        )
                )
        );
    }

    private DestinationEventsResponse dubai(CityDirectory.AirportRef a) {
        return make(a,
                "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1600&q=80&auto=format&fit=crop",
                "Burj Khalifa and Dubai skyline",
                "Unsplash",
                List.of(
                        new Event(
                                "dubai-shopping-festival",
                                "Dubai Shopping Festival",
                                "cultural",
                                dateFor(Month.DECEMBER, 6), dateFor(Month.JANUARY, 14),
                                "10:00",
                                "Citywide malls + Global Village",
                                "Across Dubai",
                                "Six weeks of mall-wide sales, nightly fireworks at Dubai Festival City, concerts, and Global Village's 90 country pavilions.",
                                "Six weeks of sales and fireworks",
                                new Image(
                                        "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=1200&q=80&auto=format&fit=crop",
                                        "Dubai skyline",
                                        "Unsplash"
                                ),
                                "https://mydsf.ae",
                                BigDecimal.ZERO, true
                        ),
                        new Event(
                                "art-dubai",
                                "Art Dubai",
                                "cultural",
                                dateFor(Month.MARCH, 4), dateFor(Month.MARCH, 8),
                                "12:00",
                                "Madinat Jumeirah",
                                "Jumeirah",
                                "The Middle East's leading contemporary art fair, spanning galleries from Beirut to Lagos to Tehran.",
                                "Contemporary art from the MENA scene",
                                new Image(
                                        "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=1200&q=80&auto=format&fit=crop",
                                        "Art fair",
                                        "Unsplash"
                                ),
                                "https://artdubai.ae",
                                BigDecimal.valueOf(90), false
                        ),
                        new Event(
                                "dubai-food-festival",
                                "Dubai Food Festival",
                                "food",
                                dateFor(Month.APRIL, 25), dateFor(Month.MAY, 11),
                                "12:00",
                                "Citywide",
                                "Across Dubai",
                                "Two weeks of restaurant offers, chef pop-ups, Beach Canteen by the sea and the Etisalat Taste of Dubai headline event.",
                                "Two weeks at the city's table",
                                new Image(
                                        "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&q=80&auto=format&fit=crop",
                                        "Food festival",
                                        "Unsplash"
                                ),
                                null, BigDecimal.valueOf(20), false
                        ),
                        new Event(
                                "nye-burj-khalifa",
                                "Burj Khalifa New Year fireworks",
                                "seasonal",
                                dateFor(Month.DECEMBER, 31), dateFor(Month.JANUARY, 1),
                                "20:00",
                                "Downtown Dubai",
                                "Downtown",
                                "The world's most-watched fireworks display. Reserve a Downtown restaurant by mid-November or accept the beach from afar.",
                                "The world watches the tallest building explode into light",
                                new Image(
                                        "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=1200&q=80&auto=format&fit=crop",
                                        "Fireworks",
                                        "Unsplash"
                                ),
                                null, BigDecimal.ZERO, false
                        )
                )
        );
    }

    private DestinationEventsResponse istanbul(CityDirectory.AirportRef a) {
        return make(a,
                "https://images.unsplash.com/photo-1527838832700-5059252407fa?w=1600&q=80&auto=format&fit=crop",
                "Hagia Sophia and Bosphorus at dawn",
                "Unsplash",
                List.of(
                        new Event(
                                "tulip-festival",
                                "Istanbul Tulip Festival",
                                "seasonal",
                                dateFor(Month.APRIL, 1), dateFor(Month.APRIL, 30),
                                "",
                                "Emirgan Park, Gülhane, Sultanahmet",
                                "Multiple parks",
                                "Three million tulips — the flower's true historical home. Emirgan Park has the most dramatic displays along the Bosphorus.",
                                "Three million tulips, the flower's birthplace",
                                new Image(
                                        "https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?w=1200&q=80&auto=format&fit=crop",
                                        "Tulip field",
                                        "Unsplash"
                                ),
                                null, BigDecimal.ZERO, true
                        ),
                        new Event(
                                "istanbul-music-festival",
                                "Istanbul Music Festival",
                                "music",
                                dateFor(Month.JUNE, 3), dateFor(Month.JUNE, 23),
                                "20:00",
                                "Various historic venues",
                                "Sultanahmet, Beyoğlu",
                                "Three weeks of classical concerts in historic palaces, churches and museums — Hagia Eirene is the jewel.",
                                "Classical music, in Byzantine rooms",
                                new Image(
                                        "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=1200&q=80&auto=format&fit=crop",
                                        "Concert hall",
                                        "Unsplash"
                                ),
                                "https://muzik.iksv.org",
                                BigDecimal.valueOf(30), false
                        ),
                        new Event(
                                "istanbul-biennial",
                                "Istanbul Biennial",
                                "cultural",
                                dateFor(Month.SEPTEMBER, 14), dateFor(Month.NOVEMBER, 10),
                                "10:00",
                                "15+ venues across Beyoğlu and the Bosphorus",
                                "Multiple neighbourhoods",
                                "Contemporary art spread across old boatyards, hammams and office buildings. Many venues are free; buy a single pass for the paid ones.",
                                "Contemporary art in forgotten rooms",
                                new Image(
                                        "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=1200&q=80&auto=format&fit=crop",
                                        "Contemporary art",
                                        "Unsplash"
                                ),
                                null, BigDecimal.valueOf(15), false
                        ),
                        new Event(
                                "ramadan-iftar",
                                "Ramadan iftars in Sultanahmet",
                                "cultural",
                                dateFor(Month.FEBRUARY, 18), dateFor(Month.MARCH, 19),
                                "18:30",
                                "Sultanahmet Square",
                                "Fatih",
                                "The city's collective sundown meal. Free iftar tents seat thousands in Sultanahmet Square across the month.",
                                "The city breaks fast together",
                                new Image(
                                        "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&q=80&auto=format&fit=crop",
                                        "Iftar meal",
                                        "Unsplash"
                                ),
                                null, BigDecimal.ZERO, false
                        )
                )
        );
    }

    private DestinationEventsResponse singapore(CityDirectory.AirportRef a) {
        return make(a,
                "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1600&q=80&auto=format&fit=crop",
                "Marina Bay Sands and Singapore skyline",
                "Unsplash",
                List.of(
                        new Event(
                                "chinese-new-year",
                                "Chinese New Year · Chingay Parade",
                                "festival",
                                dateFor(Month.FEBRUARY, 13), dateFor(Month.FEBRUARY, 14),
                                "20:00",
                                "F1 Pit Building",
                                "Marina Bay",
                                "Southeast Asia's largest street performance parade — 10 000 performers, lion dances, floats, fireworks over Marina Bay.",
                                "Lion dances and 10 000 performers",
                                new Image(
                                        "https://images.unsplash.com/photo-1515005024608-00d7d17c71c0?w=1200&q=80&auto=format&fit=crop",
                                        "Chinese new year lanterns",
                                        "Unsplash"
                                ),
                                "https://chingay.org.sg",
                                BigDecimal.valueOf(30), true
                        ),
                        new Event(
                                "singapore-food-festival",
                                "Singapore Food Festival",
                                "food",
                                dateFor(Month.AUGUST, 22), dateFor(Month.AUGUST, 31),
                                "11:00",
                                "Hawker centres + chef pop-ups citywide",
                                "Across Singapore",
                                "Hawker heritage tastings, chef collaborations and pop-ups. Sentosa's STREAT outdoor village is the weekend anchor.",
                                "Ten days at a hawker table",
                                new Image(
                                        "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&q=80&auto=format&fit=crop",
                                        "Hawker food",
                                        "Unsplash"
                                ),
                                null, BigDecimal.valueOf(8), false
                        ),
                        new Event(
                                "f1-singapore-gp",
                                "Formula 1 Singapore Grand Prix",
                                "sports",
                                dateFor(Month.SEPTEMBER, 19), dateFor(Month.SEPTEMBER, 21),
                                "20:00",
                                "Marina Bay Street Circuit",
                                "Downtown",
                                "The only night race in F1, run around downtown. Tickets bundle concerts from global headliners at three stages.",
                                "The only night race in F1",
                                new Image(
                                        "https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?w=1200&q=80&auto=format&fit=crop",
                                        "Formula 1 race",
                                        "Unsplash"
                                ),
                                "https://singaporegp.sg",
                                BigDecimal.valueOf(150), false
                        ),
                        new Event(
                                "deepavali",
                                "Deepavali in Little India",
                                "festival",
                                dateFor(Month.OCTOBER, 20), dateFor(Month.NOVEMBER, 5),
                                "18:00",
                                "Serangoon Road",
                                "Little India",
                                "Two weeks of lights along Serangoon Road, marigold garlands, sweet stalls and the Thimithi fire-walking ceremony.",
                                "A river of lights along Serangoon",
                                new Image(
                                        "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=1200&q=80&auto=format&fit=crop",
                                        "Diwali lights",
                                        "Unsplash"
                                ),
                                null, BigDecimal.ZERO, false
                        )
                )
        );
    }

    private DestinationEventsResponse venice(CityDirectory.AirportRef a) {
        return make(a,
                "https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=1600&q=80&auto=format&fit=crop",
                "Venetian canals at dawn",
                "Unsplash",
                List.of(
                        new Event(
                                "carnevale",
                                "Carnevale di Venezia",
                                "festival",
                                dateFor(Month.FEBRUARY, 7), dateFor(Month.FEBRUARY, 17),
                                "11:00",
                                "Piazza San Marco + across Venice",
                                "San Marco",
                                "Ten days of masked balls, costumed parades and gondolas on the Grand Canal. Mask-making workshops run throughout.",
                                "Masks, gondolas, one long masquerade",
                                new Image(
                                        "https://images.unsplash.com/photo-1503264116251-35a269479413?w=1200&q=80&auto=format&fit=crop",
                                        "Venetian masks",
                                        "Unsplash"
                                ),
                                "https://carnevale.venezia.it",
                                BigDecimal.valueOf(45), true
                        ),
                        new Event(
                                "biennale",
                                "Venice Biennale",
                                "cultural",
                                dateFor(Month.MAY, 10), dateFor(Month.NOVEMBER, 23),
                                "10:00",
                                "Giardini + Arsenale",
                                "Castello",
                                "Six months of contemporary art from 80+ national pavilions. Alternates with the Architecture Biennale in odd years.",
                                "80 national pavilions, six months",
                                new Image(
                                        "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=1200&q=80&auto=format&fit=crop",
                                        "Art exhibition",
                                        "Unsplash"
                                ),
                                "https://labiennale.org",
                                BigDecimal.valueOf(25), false
                        ),
                        new Event(
                                "venice-film-festival",
                                "Venice International Film Festival",
                                "cultural",
                                dateFor(Month.AUGUST, 27), dateFor(Month.SEPTEMBER, 6),
                                "19:00",
                                "Palazzo del Cinema, Lido",
                                "Lido di Venezia",
                                "The world's oldest film festival. Red-carpet premieres on the Lido followed by day tickets from 12€ for public screenings.",
                                "The oldest red carpet in cinema",
                                new Image(
                                        "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&q=80&auto=format&fit=crop",
                                        "Cinema",
                                        "Unsplash"
                                ),
                                "https://labiennale.org/en/cinema",
                                BigDecimal.valueOf(12), false
                        )
                )
        );
    }

    private DestinationEventsResponse rio(CityDirectory.AirportRef a) {
        return make(a,
                "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1600&q=80&auto=format&fit=crop",
                "Rio de Janeiro and Sugarloaf Mountain",
                "Unsplash",
                List.of(
                        new Event(
                                "carnaval",
                                "Carnaval do Rio",
                                "festival",
                                dateFor(Month.FEBRUARY, 13), dateFor(Month.FEBRUARY, 18),
                                "21:00",
                                "Sambódromo + street blocos citywide",
                                "Centro + Zona Sul",
                                "Five days when the city does almost nothing else. Samba school parades at the Sambódromo; 500+ free street blocos for everyone else.",
                                "Samba, blocos, 500 free street parties",
                                new Image(
                                        "https://images.unsplash.com/photo-1541417904950-b855846fe074?w=1200&q=80&auto=format&fit=crop",
                                        "Carnival",
                                        "Unsplash"
                                ),
                                "https://liesa.globo.com",
                                BigDecimal.valueOf(50), true
                        ),
                        new Event(
                                "reveillon-copacabana",
                                "Réveillon · Copacabana New Year",
                                "seasonal",
                                dateFor(Month.DECEMBER, 31), dateFor(Month.JANUARY, 1),
                                "20:00",
                                "Copacabana Beach",
                                "Zona Sul",
                                "Two million in white on the sand, offerings to Iemanjá floating into the sea, 12 minutes of fireworks at midnight.",
                                "Two million in white on the sand",
                                new Image(
                                        "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=1200&q=80&auto=format&fit=crop",
                                        "Fireworks over beach",
                                        "Unsplash"
                                ),
                                null, BigDecimal.ZERO, false
                        ),
                        new Event(
                                "rock-in-rio",
                                "Rock in Rio",
                                "music",
                                dateFor(Month.SEPTEMBER, 11), dateFor(Month.SEPTEMBER, 20),
                                "16:00",
                                "Parque Olímpico",
                                "Barra da Tijuca",
                                "Seven nights of global headliners across seven stages — 700 000 tickets typically sell in 48 hours when released.",
                                "Seven nights, seven stages",
                                new Image(
                                        "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200&q=80&auto=format&fit=crop",
                                        "Rock concert",
                                        "Unsplash"
                                ),
                                "https://rockinrio.com",
                                BigDecimal.valueOf(120), false
                        )
                )
        );
    }

    private DestinationEventsResponse generic(CityDirectory.AirportRef a) {
        return make(a,
                "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600&q=80&auto=format&fit=crop",
                "A distant horizon",
                "Unsplash",
                List.of(
                        new Event(
                                "local-listings",
                                "Check local listings",
                                "cultural",
                                LocalDate.now(), LocalDate.now().plusMonths(6),
                                "",
                                a.city(),
                                "Citywide",
                                "We don't have a curated calendar for this destination yet. Search for \"" + a.city() + " events\" + your travel month for festivals, concerts and seasonal highlights.",
                                "Plenty to discover — on your own terms",
                                null,
                                null,
                                null,
                                true
                        )
                )
        );
    }
}
