/**
 * Airport directory — frontend mirror of the backend CityDirectory.
 * Used for instant autocomplete in the flight search form so the user
 * can pick real airports without any network round-trip.
 */

export interface AirportEntry {
  iata: string;
  airportName: string;
  city: string;
  country: string;
}

export const AIRPORTS: ReadonlyArray<AirportEntry> = [
  // Europe
  { iata: "CDG", airportName: "Charles de Gaulle Airport", city: "Paris", country: "France" },
  { iata: "ORY", airportName: "Paris-Orly Airport", city: "Paris", country: "France" },
  { iata: "LHR", airportName: "Heathrow Airport", city: "London", country: "United Kingdom" },
  { iata: "LGW", airportName: "Gatwick Airport", city: "London", country: "United Kingdom" },
  { iata: "FRA", airportName: "Frankfurt Airport", city: "Frankfurt", country: "Germany" },
  { iata: "MUC", airportName: "Munich Airport", city: "Munich", country: "Germany" },
  { iata: "AMS", airportName: "Amsterdam Schiphol", city: "Amsterdam", country: "Netherlands" },
  { iata: "MAD", airportName: "Madrid-Barajas Airport", city: "Madrid", country: "Spain" },
  { iata: "BCN", airportName: "Barcelona-El Prat Airport", city: "Barcelona", country: "Spain" },
  { iata: "FCO", airportName: "Leonardo da Vinci Airport", city: "Rome", country: "Italy" },
  { iata: "MXP", airportName: "Milan Malpensa Airport", city: "Milan", country: "Italy" },
  { iata: "LIS", airportName: "Humberto Delgado Airport", city: "Lisbon", country: "Portugal" },
  { iata: "ATH", airportName: "Eleftherios Venizelos", city: "Athens", country: "Greece" },
  { iata: "VIE", airportName: "Vienna International Airport", city: "Vienna", country: "Austria" },
  { iata: "ZRH", airportName: "Zurich Airport", city: "Zurich", country: "Switzerland" },
  { iata: "CPH", airportName: "Copenhagen Airport", city: "Copenhagen", country: "Denmark" },
  { iata: "ARN", airportName: "Stockholm Arlanda", city: "Stockholm", country: "Sweden" },
  { iata: "OSL", airportName: "Oslo Airport", city: "Oslo", country: "Norway" },
  { iata: "HEL", airportName: "Helsinki-Vantaa Airport", city: "Helsinki", country: "Finland" },
  { iata: "DUB", airportName: "Dublin Airport", city: "Dublin", country: "Ireland" },
  { iata: "IST", airportName: "Istanbul Airport", city: "Istanbul", country: "Turkey" },
  { iata: "WAW", airportName: "Chopin Airport", city: "Warsaw", country: "Poland" },
  { iata: "PRG", airportName: "Václav Havel Airport", city: "Prague", country: "Czech Republic" },
  { iata: "MRS", airportName: "Marseille Provence Airport", city: "Marseille", country: "France" },
  { iata: "LYS", airportName: "Lyon-Saint Exupéry Airport", city: "Lyon", country: "France" },
  { iata: "NCE", airportName: "Nice Côte d'Azur Airport", city: "Nice", country: "France" },
  { iata: "TLS", airportName: "Toulouse-Blagnac Airport", city: "Toulouse", country: "France" },
  { iata: "BOD", airportName: "Bordeaux-Mérignac Airport", city: "Bordeaux", country: "France" },

  // North America
  { iata: "JFK", airportName: "John F. Kennedy International", city: "New York", country: "United States" },
  { iata: "EWR", airportName: "Newark Liberty International", city: "Newark", country: "United States" },
  { iata: "LAX", airportName: "Los Angeles International", city: "Los Angeles", country: "United States" },
  { iata: "SFO", airportName: "San Francisco International", city: "San Francisco", country: "United States" },
  { iata: "ORD", airportName: "O'Hare International Airport", city: "Chicago", country: "United States" },
  { iata: "MIA", airportName: "Miami International Airport", city: "Miami", country: "United States" },
  { iata: "BOS", airportName: "Boston Logan International", city: "Boston", country: "United States" },
  { iata: "YYZ", airportName: "Toronto Pearson International", city: "Toronto", country: "Canada" },
  { iata: "YUL", airportName: "Montréal-Trudeau", city: "Montreal", country: "Canada" },
  { iata: "MEX", airportName: "Benito Juárez International", city: "Mexico City", country: "Mexico" },

  // South America
  { iata: "GRU", airportName: "São Paulo/Guarulhos", city: "São Paulo", country: "Brazil" },
  { iata: "EZE", airportName: "Ministro Pistarini Airport", city: "Buenos Aires", country: "Argentina" },
  { iata: "SCL", airportName: "Arturo Merino Benítez", city: "Santiago", country: "Chile" },
  { iata: "BOG", airportName: "El Dorado International", city: "Bogotá", country: "Colombia" },
  { iata: "LIM", airportName: "Jorge Chávez International", city: "Lima", country: "Peru" },

  // Middle East
  { iata: "DXB", airportName: "Dubai International Airport", city: "Dubai", country: "United Arab Emirates" },
  { iata: "AUH", airportName: "Abu Dhabi International", city: "Abu Dhabi", country: "United Arab Emirates" },
  { iata: "DOH", airportName: "Hamad International Airport", city: "Doha", country: "Qatar" },
  { iata: "TLV", airportName: "Ben Gurion Airport", city: "Tel Aviv", country: "Israel" },
  { iata: "CAI", airportName: "Cairo International Airport", city: "Cairo", country: "Egypt" },

  // Africa
  { iata: "CMN", airportName: "Mohammed V International", city: "Casablanca", country: "Morocco" },
  { iata: "RAK", airportName: "Marrakesh Menara Airport", city: "Marrakech", country: "Morocco" },
  { iata: "TUN", airportName: "Tunis-Carthage Airport", city: "Tunis", country: "Tunisia" },
  { iata: "ALG", airportName: "Houari Boumediene Airport", city: "Algiers", country: "Algeria" },
  { iata: "DKR", airportName: "Blaise Diagne Airport", city: "Dakar", country: "Senegal" },
  { iata: "ABJ", airportName: "Port Bouet Airport", city: "Abidjan", country: "Ivory Coast" },
  { iata: "LBV", airportName: "Léon-Mba International", city: "Libreville", country: "Gabon" },
  { iata: "DLA", airportName: "Douala International Airport", city: "Douala", country: "Cameroon" },
  { iata: "LOS", airportName: "Murtala Muhammed Airport", city: "Lagos", country: "Nigeria" },
  { iata: "NBO", airportName: "Jomo Kenyatta International", city: "Nairobi", country: "Kenya" },
  { iata: "JNB", airportName: "O. R. Tambo International", city: "Johannesburg", country: "South Africa" },
  { iata: "CPT", airportName: "Cape Town International", city: "Cape Town", country: "South Africa" },
  { iata: "ADD", airportName: "Bole International Airport", city: "Addis Ababa", country: "Ethiopia" },

  // Asia
  { iata: "NRT", airportName: "Narita International Airport", city: "Tokyo", country: "Japan" },
  { iata: "HND", airportName: "Haneda Airport", city: "Tokyo", country: "Japan" },
  { iata: "ICN", airportName: "Incheon International", city: "Seoul", country: "South Korea" },
  { iata: "PEK", airportName: "Beijing Capital International", city: "Beijing", country: "China" },
  { iata: "PVG", airportName: "Pudong International", city: "Shanghai", country: "China" },
  { iata: "HKG", airportName: "Hong Kong International", city: "Hong Kong", country: "Hong Kong" },
  { iata: "SIN", airportName: "Changi Airport", city: "Singapore", country: "Singapore" },
  { iata: "BKK", airportName: "Suvarnabhumi Airport", city: "Bangkok", country: "Thailand" },
  { iata: "KUL", airportName: "Kuala Lumpur International", city: "Kuala Lumpur", country: "Malaysia" },
  { iata: "CGK", airportName: "Soekarno-Hatta International", city: "Jakarta", country: "Indonesia" },
  { iata: "DEL", airportName: "Indira Gandhi International", city: "Delhi", country: "India" },
  { iata: "BOM", airportName: "Chhatrapati Shivaji International", city: "Mumbai", country: "India" },
  { iata: "HAN", airportName: "Noi Bai International", city: "Hanoi", country: "Vietnam" },
  { iata: "SGN", airportName: "Tan Son Nhat International", city: "Ho Chi Minh City", country: "Vietnam" },

  // Oceania
  { iata: "SYD", airportName: "Sydney Kingsford Smith", city: "Sydney", country: "Australia" },
  { iata: "MEL", airportName: "Melbourne Airport", city: "Melbourne", country: "Australia" },
  { iata: "AKL", airportName: "Auckland Airport", city: "Auckland", country: "New Zealand" },
];

/** Normalise for case + diacritics insensitive comparison. */
const normalise = (s: string): string =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

/**
 * Search airports against a free-form query. Returns the best matches,
 * ranked by: IATA exact → city starts-with → city contains → name contains
 * → country contains. Max `limit` results.
 */
export function searchAirports(
  query: string,
  limit: number = 7
): AirportEntry[] {
  const q = normalise(query);
  if (!q) return [];

  const rank = (a: AirportEntry): number => {
    const iata = a.iata.toLowerCase();
    const city = normalise(a.city);
    const name = normalise(a.airportName);
    const country = normalise(a.country);

    if (iata === q) return 0;
    if (iata.startsWith(q)) return 1;
    if (city === q) return 2;
    if (city.startsWith(q)) return 3;
    if (name.startsWith(q)) return 4;
    if (city.includes(q)) return 5;
    if (name.includes(q)) return 6;
    if (country.startsWith(q)) return 7;
    if (country.includes(q)) return 8;
    return 99;
  };

  return [...AIRPORTS]
    .map((a) => ({ a, r: rank(a) }))
    .filter(({ r }) => r < 99)
    .sort((x, y) => x.r - y.r || x.a.city.localeCompare(y.a.city))
    .slice(0, limit)
    .map(({ a }) => a);
}
