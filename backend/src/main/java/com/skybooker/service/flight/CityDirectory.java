package com.skybooker.service.flight;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Small in-memory directory of well-known cities / airports used when
 * resolving free-form user queries (city name or IATA code) into a
 * known airport. Not exhaustive — just enough coverage to make mock
 * searches look plausible for the demo.
 */
public final class CityDirectory {

    public record AirportRef(
            String iata,
            String airportName,
            String city,
            String country,
            double lat,
            double lng
    ) {}

    private static final List<AirportRef> AIRPORTS = List.of(
            // Europe
            new AirportRef("CDG", "Charles de Gaulle Airport", "Paris", "France", 49.0097, 2.5479),
            new AirportRef("ORY", "Paris-Orly Airport", "Paris", "France", 48.7262, 2.3652),
            new AirportRef("LHR", "Heathrow Airport", "London", "United Kingdom", 51.4700, -0.4543),
            new AirportRef("LGW", "Gatwick Airport", "London", "United Kingdom", 51.1537, -0.1821),
            new AirportRef("FRA", "Frankfurt Airport", "Frankfurt", "Germany", 50.0379, 8.5622),
            new AirportRef("MUC", "Munich Airport", "Munich", "Germany", 48.3538, 11.7861),
            new AirportRef("AMS", "Amsterdam Schiphol", "Amsterdam", "Netherlands", 52.3105, 4.7683),
            new AirportRef("MAD", "Madrid-Barajas Airport", "Madrid", "Spain", 40.4936, -3.5668),
            new AirportRef("BCN", "Barcelona-El Prat Airport", "Barcelona", "Spain", 41.2974, 2.0833),
            new AirportRef("FCO", "Leonardo da Vinci Airport", "Rome", "Italy", 41.8003, 12.2389),
            new AirportRef("MXP", "Milan Malpensa Airport", "Milan", "Italy", 45.6306, 8.7281),
            new AirportRef("LIS", "Humberto Delgado Airport", "Lisbon", "Portugal", 38.7756, -9.1354),
            new AirportRef("ATH", "Eleftherios Venizelos", "Athens", "Greece", 37.9364, 23.9445),
            new AirportRef("VIE", "Vienna International Airport", "Vienna", "Austria", 48.1103, 16.5697),
            new AirportRef("ZRH", "Zurich Airport", "Zurich", "Switzerland", 47.4647, 8.5492),
            new AirportRef("CPH", "Copenhagen Airport", "Copenhagen", "Denmark", 55.6180, 12.6508),
            new AirportRef("ARN", "Stockholm Arlanda", "Stockholm", "Sweden", 59.6498, 17.9237),
            new AirportRef("OSL", "Oslo Airport", "Oslo", "Norway", 60.1976, 11.1004),
            new AirportRef("HEL", "Helsinki-Vantaa Airport", "Helsinki", "Finland", 60.3172, 24.9633),
            new AirportRef("DUB", "Dublin Airport", "Dublin", "Ireland", 53.4213, -6.2701),
            new AirportRef("IST", "Istanbul Airport", "Istanbul", "Turkey", 41.2753, 28.7519),
            new AirportRef("WAW", "Chopin Airport", "Warsaw", "Poland", 52.1657, 20.9671),
            new AirportRef("PRG", "Václav Havel Airport", "Prague", "Czech Republic", 50.1008, 14.2600),
            new AirportRef("MRS", "Marseille Provence Airport", "Marseille", "France", 43.4393, 5.2214),
            new AirportRef("LYS", "Lyon-Saint Exupéry Airport", "Lyon", "France", 45.7256, 5.0811),
            new AirportRef("NCE", "Nice Côte d'Azur Airport", "Nice", "France", 43.6584, 7.2159),
            new AirportRef("TLS", "Toulouse-Blagnac Airport", "Toulouse", "France", 43.6293, 1.3638),
            new AirportRef("BOD", "Bordeaux-Mérignac Airport", "Bordeaux", "France", 44.8283, -0.7156),

            // North America
            new AirportRef("JFK", "John F. Kennedy International", "New York", "United States", 40.6413, -73.7781),
            new AirportRef("EWR", "Newark Liberty International", "Newark", "United States", 40.6895, -74.1745),
            new AirportRef("LAX", "Los Angeles International", "Los Angeles", "United States", 33.9416, -118.4085),
            new AirportRef("SFO", "San Francisco International", "San Francisco", "United States", 37.6213, -122.3790),
            new AirportRef("ORD", "O'Hare International Airport", "Chicago", "United States", 41.9742, -87.9073),
            new AirportRef("MIA", "Miami International Airport", "Miami", "United States", 25.7959, -80.2870),
            new AirportRef("BOS", "Boston Logan International", "Boston", "United States", 42.3656, -71.0096),
            new AirportRef("YYZ", "Toronto Pearson International", "Toronto", "Canada", 43.6777, -79.6248),
            new AirportRef("YUL", "Montréal-Trudeau", "Montreal", "Canada", 45.4706, -73.7408),
            new AirportRef("MEX", "Benito Juárez International", "Mexico City", "Mexico", 19.4363, -99.0721),

            // South America
            new AirportRef("GRU", "São Paulo/Guarulhos", "São Paulo", "Brazil", -23.4356, -46.4731),
            new AirportRef("EZE", "Ministro Pistarini Airport", "Buenos Aires", "Argentina", -34.8222, -58.5358),
            new AirportRef("SCL", "Arturo Merino Benítez", "Santiago", "Chile", -33.3928, -70.7858),
            new AirportRef("BOG", "El Dorado International", "Bogotá", "Colombia", 4.7016, -74.1469),
            new AirportRef("LIM", "Jorge Chávez International", "Lima", "Peru", -12.0219, -77.1143),

            // Middle East
            new AirportRef("DXB", "Dubai International Airport", "Dubai", "United Arab Emirates", 25.2532, 55.3657),
            new AirportRef("AUH", "Abu Dhabi International", "Abu Dhabi", "United Arab Emirates", 24.4330, 54.6511),
            new AirportRef("DOH", "Hamad International Airport", "Doha", "Qatar", 25.2731, 51.6080),
            new AirportRef("TLV", "Ben Gurion Airport", "Tel Aviv", "Israel", 32.0114, 34.8867),
            new AirportRef("CAI", "Cairo International Airport", "Cairo", "Egypt", 30.1219, 31.4056),

            // Africa
            new AirportRef("CMN", "Mohammed V International", "Casablanca", "Morocco", 33.3675, -7.5898),
            new AirportRef("RAK", "Marrakesh Menara Airport", "Marrakech", "Morocco", 31.6069, -8.0363),
            new AirportRef("TUN", "Tunis-Carthage Airport", "Tunis", "Tunisia", 36.8510, 10.2272),
            new AirportRef("ALG", "Houari Boumediene Airport", "Algiers", "Algeria", 36.6910, 3.2155),
            new AirportRef("DKR", "Blaise Diagne Airport", "Dakar", "Senegal", 14.6708, -17.0731),
            new AirportRef("ABJ", "Port Bouet Airport", "Abidjan", "Ivory Coast", 5.2614, -3.9262),
            new AirportRef("LBV", "Léon-Mba International", "Libreville", "Gabon", 0.4586, 9.4122),
            new AirportRef("DLA", "Douala International Airport", "Douala", "Cameroon", 4.0061, 9.7195),
            new AirportRef("LOS", "Murtala Muhammed Airport", "Lagos", "Nigeria", 6.5774, 3.3212),
            new AirportRef("NBO", "Jomo Kenyatta International", "Nairobi", "Kenya", -1.3192, 36.9278),
            new AirportRef("JNB", "O. R. Tambo International", "Johannesburg", "South Africa", -26.1392, 28.2460),
            new AirportRef("CPT", "Cape Town International", "Cape Town", "South Africa", -33.9648, 18.6017),
            new AirportRef("ADD", "Bole International Airport", "Addis Ababa", "Ethiopia", 8.9779, 38.7993),

            // Asia
            new AirportRef("NRT", "Narita International Airport", "Tokyo", "Japan", 35.7720, 140.3929),
            new AirportRef("HND", "Haneda Airport", "Tokyo", "Japan", 35.5494, 139.7798),
            new AirportRef("ICN", "Incheon International", "Seoul", "South Korea", 37.4602, 126.4407),
            new AirportRef("PEK", "Beijing Capital International", "Beijing", "China", 40.0799, 116.6031),
            new AirportRef("PVG", "Pudong International", "Shanghai", "China", 31.1443, 121.8083),
            new AirportRef("HKG", "Hong Kong International", "Hong Kong", "Hong Kong", 22.3080, 113.9185),
            new AirportRef("SIN", "Changi Airport", "Singapore", "Singapore", 1.3644, 103.9915),
            new AirportRef("BKK", "Suvarnabhumi Airport", "Bangkok", "Thailand", 13.6900, 100.7501),
            new AirportRef("KUL", "Kuala Lumpur International", "Kuala Lumpur", "Malaysia", 2.7456, 101.7099),
            new AirportRef("CGK", "Soekarno-Hatta International", "Jakarta", "Indonesia", -6.1256, 106.6558),
            new AirportRef("DEL", "Indira Gandhi International", "Delhi", "India", 28.5562, 77.1000),
            new AirportRef("BOM", "Chhatrapati Shivaji International", "Mumbai", "India", 19.0896, 72.8656),
            new AirportRef("HAN", "Noi Bai International", "Hanoi", "Vietnam", 21.2212, 105.8072),
            new AirportRef("SGN", "Tan Son Nhat International", "Ho Chi Minh City", "Vietnam", 10.8188, 106.6520),

            // Oceania
            new AirportRef("SYD", "Sydney Kingsford Smith", "Sydney", "Australia", -33.9399, 151.1753),
            new AirportRef("MEL", "Melbourne Airport", "Melbourne", "Australia", -37.6733, 144.8433),
            new AirportRef("AKL", "Auckland Airport", "Auckland", "New Zealand", -37.0082, 174.7917)
    );

    private static final Map<String, AirportRef> BY_IATA;

    static {
        var map = new java.util.HashMap<String, AirportRef>();
        for (AirportRef ref : AIRPORTS) {
            map.put(ref.iata().toUpperCase(), ref);
        }
        BY_IATA = Map.copyOf(map);
    }

    private CityDirectory() {}

    /**
     * Resolve a free-form query ("Paris", "cdg", "libreville") into an
     * airport reference. Matching strategy:
     *   1. Exact IATA match (upper-cased)
     *   2. City name starts with query (case-insensitive)
     *   3. City name contains query
     *   4. Empty if none found
     */
    public static Optional<AirportRef> resolve(String query) {
        if (query == null || query.isBlank()) return Optional.empty();
        String q = query.trim();

        // IATA exact match
        if (q.length() == 3) {
            AirportRef byCode = BY_IATA.get(q.toUpperCase());
            if (byCode != null) return Optional.of(byCode);
        }

        String lower = q.toLowerCase();

        // City starts-with
        for (AirportRef ref : AIRPORTS) {
            if (ref.city().toLowerCase().startsWith(lower)) {
                return Optional.of(ref);
            }
        }
        // City contains
        for (AirportRef ref : AIRPORTS) {
            if (ref.city().toLowerCase().contains(lower)) {
                return Optional.of(ref);
            }
        }
        // Country contains (last-chance fallback)
        for (AirportRef ref : AIRPORTS) {
            if (ref.country().toLowerCase().contains(lower)) {
                return Optional.of(ref);
            }
        }

        return Optional.empty();
    }

    /**
     * Build a synthetic airport reference when the query does not match
     * anything in the directory. IATA is derived from the first three
     * alphabetic characters uppercased.
     */
    public static AirportRef synthetic(String query) {
        String cleaned = query == null ? "UNK" : query.replaceAll("[^A-Za-z]", "");
        String iata = cleaned.length() >= 3
                ? cleaned.substring(0, 3).toUpperCase()
                : (cleaned + "XXX").substring(0, 3).toUpperCase();
        String city = query == null || query.isBlank()
                ? "Unknown"
                : Character.toUpperCase(query.charAt(0)) + query.substring(1).toLowerCase();
        return new AirportRef(iata, city + " Airport", city, "—", 0.0, 0.0);
    }
}
