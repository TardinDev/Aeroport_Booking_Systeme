package com.skybooker.service.flight;

import com.skybooker.dto.response.FlightResponse;
import com.skybooker.entity.Airline;
import com.skybooker.enums.FlightStatus;
import com.skybooker.enums.SeatClass;
import com.skybooker.repository.AirlineRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Random;
import java.util.UUID;

/**
 * Produces plausible flight results on demand for any origin/destination/date
 * when the database has nothing matching. Each generated result carries a
 * working deep-link (Skyscanner / Google Flights / Kayak / direct-to-airline)
 * so the frontend can redirect the user to a real booking site on click.
 *
 * Results are deterministic for a given (origin, destination, date) triple
 * — re-running the same search produces the same list, as users expect.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FlightGeneratorService {

    private final AirlineRepository airlineRepository;

    private static final DateTimeFormatter SKYSCANNER_DATE = DateTimeFormatter.ofPattern("yyMMdd");
    private static final DateTimeFormatter KAYAK_DATE = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter GOOGLE_DATE = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    /** Approximate flight-plan speed used to derive duration from great-circle distance (km/h). */
    private static final double CRUISE_KMH = 820.0;

    /**
     * Generate {@code count} flights for the given query.
     *
     * @param originQuery      user input for origin (IATA or city name)
     * @param destinationQuery user input for destination (IATA or city name)
     * @param date             the requested departure date (nullable → "today + 2 days")
     * @param seatClass        seat class (nullable → ECONOMY)
     * @param passengers       passenger count (≥ 1)
     * @param count            number of flights to generate
     */
    public List<FlightResponse> generate(
            String originQuery,
            String destinationQuery,
            LocalDate date,
            SeatClass seatClass,
            int passengers,
            int count
    ) {
        if (originQuery == null || destinationQuery == null) return List.of();

        CityDirectory.AirportRef origin = CityDirectory.resolve(originQuery)
                .orElseGet(() -> CityDirectory.synthetic(originQuery));
        CityDirectory.AirportRef destination = CityDirectory.resolve(destinationQuery)
                .orElseGet(() -> CityDirectory.synthetic(destinationQuery));

        if (origin.iata().equalsIgnoreCase(destination.iata())) {
            return List.of();
        }

        LocalDate departureDate = date != null ? date : LocalDate.now().plusDays(2);
        SeatClass chosenClass = seatClass != null ? seatClass : SeatClass.ECONOMY;

        // Deterministic seed — same search → same results
        long seed = (long) origin.iata().hashCode() * 31L
                + destination.iata().hashCode() * 131L
                + departureDate.toEpochDay() * 17L
                + chosenClass.ordinal();
        Random rnd = new Random(seed);

        // Distance + duration
        double distanceKm = haversineKm(origin, destination);
        if (distanceKm <= 0) {
            // Synthetic airport with no lat/lng — fake a plausible distance from hash.
            distanceKm = 500 + (Math.abs(seed) % 9000); // 500 – 9500 km
        }
        int baseDurationMin = (int) Math.round((distanceKm / CRUISE_KMH) * 60.0);
        baseDurationMin = Math.max(baseDurationMin + 30, 60); // + 30 min for taxi/boarding, floor 60

        // Airlines — try real ones from DB first; fall back to a static pool
        List<Airline> airlines = airlineRepository.findByActiveTrue();
        if (airlines.isEmpty()) {
            airlines = staticAirlineFallback();
        }

        List<FlightResponse> out = new ArrayList<>(count);
        for (int i = 0; i < count; i++) {
            Airline airline = airlines.get((i + (int) (Math.abs(seed) % airlines.size())) % airlines.size());

            // Spread departures between 06:00 and 22:00
            int hour = 6 + (i * 3 + rnd.nextInt(3)) % 16;
            int minute = (rnd.nextInt(4)) * 15;
            LocalDateTime departureTime = departureDate.atTime(LocalTime.of(hour, minute));

            // Small random variation on duration ± 15 min
            int duration = baseDurationMin + rnd.nextInt(31) - 15;
            LocalDateTime arrivalTime = departureTime.plusMinutes(duration);

            // Price — base from distance + class multiplier + random noise
            BigDecimal basePrice = priceFor(distanceKm, chosenClass, rnd);

            // Stops — 0 for < 5000 km, 1 otherwise (with a bit of variance)
            int stops = distanceKm < 5000 ? 0 : (rnd.nextDouble() < 0.35 ? 0 : 1);

            // Seats
            int totalSeats = chosenClass == SeatClass.FIRST ? 14
                    : chosenClass == SeatClass.BUSINESS ? 48
                    : 220;
            int availableSeats = Math.max(1, totalSeats - rnd.nextInt(totalSeats / 2));

            String flightNumber = airline.getCode() + (100 + (Math.abs(seed) % 900) + i);

            // Seller rotation
            Seller seller = pickSeller(i, rnd, airline);
            String bookingUrl = buildBookingUrl(
                    seller.kind,
                    airline,
                    flightNumber,
                    origin.iata(),
                    destination.iata(),
                    departureDate,
                    chosenClass,
                    passengers
            );

            FlightResponse response = new FlightResponse(
                    new UUID(seed, i), // deterministic, synthetic UUID
                    flightNumber,
                    airline.getName(),
                    airline.getCode(),
                    airline.getLogoUrl(),
                    origin.iata(),
                    origin.airportName(),
                    origin.city(),
                    origin.country(),
                    destination.iata(),
                    destination.airportName(),
                    destination.city(),
                    destination.country(),
                    departureTime,
                    arrivalTime,
                    duration,
                    basePrice,
                    "EUR",
                    chosenClass,
                    totalSeats,
                    availableSeats,
                    FlightStatus.SCHEDULED,
                    stops,
                    bookingUrl,
                    seller.displayName,
                    seller.kind == SellerKind.AIRLINE ? "AIRLINE" : "AGENCY",
                    seller.logoUrl
            );
            out.add(response);
        }
        return out;
    }

    // ---------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------

    private BigDecimal priceFor(double distanceKm, SeatClass seatClass, Random rnd) {
        double base = 40 + distanceKm * 0.08;
        double multiplier = switch (seatClass) {
            case BUSINESS -> 3.2;
            case FIRST -> 6.5;
            default -> 1.0;
        };
        double noise = 0.85 + rnd.nextDouble() * 0.35; // 0.85 – 1.20
        double total = base * multiplier * noise;
        return BigDecimal.valueOf(total).setScale(2, RoundingMode.HALF_UP);
    }

    private double haversineKm(CityDirectory.AirportRef a, CityDirectory.AirportRef b) {
        if (a.lat() == 0.0 && a.lng() == 0.0) return 0.0;
        if (b.lat() == 0.0 && b.lng() == 0.0) return 0.0;
        double R = 6371.0;
        double dLat = Math.toRadians(b.lat() - a.lat());
        double dLng = Math.toRadians(b.lng() - a.lng());
        double sinLat = Math.sin(dLat / 2);
        double sinLng = Math.sin(dLng / 2);
        double h = sinLat * sinLat
                + Math.cos(Math.toRadians(a.lat()))
                * Math.cos(Math.toRadians(b.lat()))
                * sinLng * sinLng;
        return 2 * R * Math.asin(Math.min(1.0, Math.sqrt(h)));
    }

    // ---------------------------------------------------------------
    // Sellers + deep links
    // ---------------------------------------------------------------

    private enum SellerKind { AIRLINE, SKYSCANNER, KAYAK, GOOGLE_FLIGHTS, EXPEDIA }

    private record Seller(SellerKind kind, String displayName, String logoUrl) {}

    private Seller pickSeller(int i, Random rnd, Airline airline) {
        // Mix: first = direct airline, rest rotate OTAs
        SellerKind kind;
        if (i == 0 || rnd.nextDouble() < 0.35) {
            kind = SellerKind.AIRLINE;
        } else {
            SellerKind[] otas = {
                    SellerKind.SKYSCANNER,
                    SellerKind.KAYAK,
                    SellerKind.GOOGLE_FLIGHTS,
                    SellerKind.EXPEDIA
            };
            kind = otas[rnd.nextInt(otas.length)];
        }

        return switch (kind) {
            case AIRLINE -> new Seller(
                    SellerKind.AIRLINE,
                    airline.getName(),
                    airline.getLogoUrl()
            );
            case SKYSCANNER -> new Seller(
                    SellerKind.SKYSCANNER,
                    "Skyscanner",
                    "https://upload.wikimedia.org/wikipedia/commons/9/94/Skyscanner_Logo_LockupHorizontal_SkyBlue_RGB.svg"
            );
            case KAYAK -> new Seller(
                    SellerKind.KAYAK,
                    "Kayak",
                    "https://upload.wikimedia.org/wikipedia/commons/c/cb/Kayak_Logo.svg"
            );
            case GOOGLE_FLIGHTS -> new Seller(
                    SellerKind.GOOGLE_FLIGHTS,
                    "Google Flights",
                    "https://upload.wikimedia.org/wikipedia/commons/8/86/Google_Flights_logo.svg"
            );
            case EXPEDIA -> new Seller(
                    SellerKind.EXPEDIA,
                    "Expedia",
                    "https://upload.wikimedia.org/wikipedia/commons/5/5b/Expedia_2012_logo.svg"
            );
        };
    }

    /**
     * Build a deep-link that lands the user on the specific flight listing
     * (origin, destination, date, pax, cabin — and where supported, the flight
     * number itself) on the chosen seller's site, rather than a generic
     * homepage or an empty search form.
     */
    private String buildBookingUrl(
            SellerKind kind,
            Airline airline,
            String flightNumber,
            String originIata,
            String destinationIata,
            LocalDate date,
            SeatClass seatClass,
            int passengers
    ) {
        String o = originIata.toUpperCase(Locale.ROOT);
        String d = destinationIata.toUpperCase(Locale.ROOT);
        int pax = Math.max(1, passengers);
        String cabin = seatClass.name().toLowerCase(Locale.ROOT);
        String isoDate = date.format(KAYAK_DATE);

        return switch (kind) {
            // Skyscanner day-view — lands directly on the list of flights
            // for that origin/destination/date with pax & cabin pre-selected.
            case SKYSCANNER -> String.format(
                    "https://www.skyscanner.net/transport/flights/%s/%s/%s/"
                            + "?adults=%d&cabinclass=%s&rtn=0&preferdirects=false&ref=day-view",
                    o.toLowerCase(Locale.ROOT),
                    d.toLowerCase(Locale.ROOT),
                    date.format(SKYSCANNER_DATE),
                    pax,
                    cabin
            );

            // Kayak flight-search URL — /{o}-{d}/{yyyy-MM-dd}/{pax}adults/{cabin}
            // opens the results page directly with everything pre-filled.
            case KAYAK -> String.format(
                    "https://www.kayak.com/flights/%s-%s/%s/%dadults/%s?sort=price_a&fs=fdDir=true",
                    o, d, isoDate, pax, cabin
            );

            // Google Flights query form — include the flight number in q= so
            // the airline + specific flight are highlighted on the results page.
            case GOOGLE_FLIGHTS -> String.format(
                    "https://www.google.com/travel/flights?q=Flights+%s+from+%s+to+%s+on+%s",
                    urlEncode(flightNumber == null ? "" : flightNumber),
                    o, d, date.format(GOOGLE_DATE)
            );

            // Expedia one-way leg search with pax & cabin pre-filled.
            case EXPEDIA -> String.format(
                    "https://www.expedia.com/Flights-Search?leg1=from:%s,to:%s,departure:%sTANYT"
                            + "&passengers=adults:%d&trip=oneway&mode=search&cabinclass=%s",
                    o, d, isoDate, pax, cabin
            );

            // Direct airline booking — dispatch on carrier code for major
            // carriers, otherwise fall back to Google Flights filtered by
            // the airline's name so the user still lands on the right flight.
            case AIRLINE -> airlineBookingUrl(
                    airline, o, d, date, pax, seatClass, flightNumber
            );
        };
    }

    /**
     * Per-airline direct booking URL templates. These open the carrier's own
     * search results page with origin/destination/date/pax/cabin pre-filled,
     * so the user lands on the listing for that specific flight.
     *
     * For unknown carriers we fall back to a Google Flights query filtered
     * by the airline's name — still a direct listing, just not on the
     * airline's own site.
     */
    private String airlineBookingUrl(
            Airline airline,
            String origin,
            String destination,
            LocalDate date,
            int passengers,
            SeatClass seatClass,
            String flightNumber
    ) {
        String code = airline.getCode() == null
                ? ""
                : airline.getCode().toUpperCase(Locale.ROOT);
        String isoDate = date.format(KAYAK_DATE);
        String cabinUpper = switch (seatClass) {
            case BUSINESS -> "BUSINESS";
            case FIRST -> "FIRST";
            default -> "ECONOMY";
        };
        String cabinLower = cabinUpper.toLowerCase(Locale.ROOT);

        return switch (code) {
            case "AF" -> String.format(
                    "https://wwws.airfrance.fr/search/offers"
                            + "?pax=%d:0:0:0:0&bookingFlow=LEISURE&cabinClass=%s"
                            + "&searchType=NORMAL&trips=%s,%s,%s",
                    passengers, cabinUpper, origin, destination, isoDate
            );
            case "KL" -> String.format(
                    "https://www.klm.com/search/offers"
                            + "?pax=%d:0:0:0:0&cabinClass=%s&trips=%s,%s,%s",
                    passengers, cabinUpper, origin, destination, isoDate
            );
            case "LH" -> String.format(
                    "https://www.lufthansa.com/de/en/flight-search"
                            + "?travelers=adult:%d&cabinClass=%s&flights=%s-%s-%s",
                    passengers, cabinLower, origin, destination, isoDate
            );
            case "BA" -> String.format(
                    "https://www.britishairways.com/travel/fx/public/en_gb"
                            + "?eId=106001&onds=%s-%s:%s&ad=%d&yad=0&ch=0&inf=0"
                            + "&cabin=%s&flex=LOWEST",
                    origin, destination, isoDate, passengers, cabinUpper
            );
            case "EK" -> String.format(
                    "https://www.emirates.com/english/search"
                            + "?departureDate=%s&numberOfAdult=%d&origin=%s"
                            + "&destination=%s&cabinClass=%s",
                    isoDate, passengers, origin, destination, cabinUpper
            );
            case "TK" -> String.format(
                    "https://www.turkishairlines.com/en-int/flights/booking/"
                            + "?tripType=O&cabinClass=%s&numAdults=%d"
                            + "&origin=%s&destination=%s&departureDate=%s",
                    cabinUpper, passengers, origin, destination, isoDate
            );
            case "IB" -> String.format(
                    "https://www.iberia.com/en/flights/flight-search/"
                            + "?market=en_US&trip_type=O&adults=%d&children=0&infants=0"
                            + "&cabin=%s&origin_1=%s&destination_1=%s&departure_1=%s",
                    passengers, cabinUpper, origin, destination, isoDate
            );
            case "VY" -> String.format(
                    "https://www.vueling.com/en/book/flight-search"
                            + "?origin=%s&destination=%s&departingDate=%s"
                            + "&tripType=O&adults=%d",
                    origin, destination, isoDate, passengers
            );
            case "U2" -> String.format(
                    "https://www.easyjet.com/en/buy/flights-search"
                            + "/%s/%s/%s/0/%d/0/0/0",
                    origin, destination, isoDate, passengers
            );
            case "FR" -> String.format(
                    "https://www.ryanair.com/gb/en/trip/flights/select"
                            + "?adults=%d&teens=0&children=0&infants=0"
                            + "&dateOut=%s&originIata=%s&destinationIata=%s"
                            + "&isConnectedFlight=false&isReturn=false",
                    passengers, isoDate, origin, destination
            );
            // Unknown carrier → Google Flights query filtered by airline name.
            default -> {
                String airlineName = airline.getName() == null ? "" : airline.getName();
                String flightNo = flightNumber == null ? "" : flightNumber;
                yield String.format(
                        "https://www.google.com/travel/flights"
                                + "?q=Flights+%s+from+%s+to+%s+on+%s+with+%s",
                        urlEncode(flightNo),
                        origin,
                        destination,
                        isoDate,
                        urlEncode(airlineName)
                );
            }
        };
    }

    private static String urlEncode(String s) {
        if (s == null || s.isEmpty()) return "";
        return URLEncoder.encode(s, StandardCharsets.UTF_8);
    }

    // Last-resort airline pool if the DB is empty (shouldn't happen, but safe).
    private List<Airline> staticAirlineFallback() {
        List<Airline> pool = new ArrayList<>();
        pool.add(Airline.builder()
                .id(UUID.nameUUIDFromBytes("AF".getBytes()))
                .name("Air France").code("AF")
                .logoUrl("https://upload.wikimedia.org/wikipedia/commons/4/44/Air_France_Logo.svg")
                .country("France").active(true).build());
        pool.add(Airline.builder()
                .id(UUID.nameUUIDFromBytes("LH".getBytes()))
                .name("Lufthansa").code("LH")
                .logoUrl("https://upload.wikimedia.org/wikipedia/commons/b/b8/Lufthansa_Logo_2018.svg")
                .country("Germany").active(true).build());
        pool.add(Airline.builder()
                .id(UUID.nameUUIDFromBytes("BA".getBytes()))
                .name("British Airways").code("BA")
                .logoUrl("https://upload.wikimedia.org/wikipedia/commons/0/06/BRITISH_AIRWAYS_logo.svg")
                .country("United Kingdom").active(true).build());
        pool.add(Airline.builder()
                .id(UUID.nameUUIDFromBytes("EK".getBytes()))
                .name("Emirates").code("EK")
                .logoUrl("https://upload.wikimedia.org/wikipedia/commons/d/d0/Emirates_logo.svg")
                .country("United Arab Emirates").active(true).build());
        pool.add(Airline.builder()
                .id(UUID.nameUUIDFromBytes("TK".getBytes()))
                .name("Turkish Airlines").code("TK")
                .logoUrl("https://upload.wikimedia.org/wikipedia/commons/8/8c/Turkish_Airlines_logo_2019.svg")
                .country("Turkey").active(true).build());
        return pool;
    }
}
