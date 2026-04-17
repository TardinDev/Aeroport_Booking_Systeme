package com.skybooker.service.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.skybooker.config.IntegrationsProperties;
import com.skybooker.dto.response.DestinationEventsResponse;
import com.skybooker.dto.response.DestinationEventsResponse.Event;
import com.skybooker.dto.response.DestinationEventsResponse.Image;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Ticketmaster Discovery API wrapper. Returns upcoming events for
 * a city mapped into our {@link Event} shape. Flag-gated.
 *
 * Free tier: 5000 requests/day. Results cached in Redis via
 * {@code destination-events} cache (6h TTL).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TicketmasterClient {

    private final IntegrationsProperties properties;
    private RestClient client;

    public boolean isEnabled() {
        return properties.getTicketmaster().isEnabled()
                && !properties.getTicketmaster().getApiKey().isBlank();
    }

    public Optional<List<Event>> searchEvents(String city, String countryCode) {
        if (!isEnabled() || city == null || city.isBlank()) return Optional.empty();
        try {
            JsonNode node = http()
                    .get()
                    .uri(uriBuilder -> {
                        var b = uriBuilder
                                .path("/events.json")
                                .queryParam("apikey", properties.getTicketmaster().getApiKey())
                                .queryParam("city", city)
                                .queryParam("sort", "date,asc")
                                .queryParam("size", 20);
                        if (countryCode != null && !countryCode.isBlank()) {
                            b.queryParam("countryCode", countryCode);
                        }
                        return b.build();
                    })
                    .header("Accept", "application/json")
                    .retrieve()
                    .body(JsonNode.class);

            if (node == null) return Optional.empty();

            JsonNode events = node.path("_embedded").path("events");
            if (!events.isArray() || events.isEmpty()) {
                log.debug("Ticketmaster returned no events for {}", city);
                return Optional.of(List.of());
            }

            List<Event> out = new ArrayList<>();
            boolean firstFeatured = true;
            for (JsonNode e : events) {
                Event mapped = mapEvent(e, firstFeatured);
                if (mapped != null) {
                    out.add(mapped);
                    firstFeatured = false;
                }
            }
            return Optional.of(out);
        } catch (Exception e) {
            log.warn("Ticketmaster search failed for {}: {}", city, e.getMessage());
            return Optional.empty();
        }
    }

    private Event mapEvent(JsonNode n, boolean featured) {
        try {
            String id = n.path("id").asText();
            String title = n.path("name").asText("");
            if (title.isBlank()) return null;

            JsonNode dates = n.path("dates");
            LocalDate startDate = parseDate(dates.path("start").path("localDate").asText(null));
            LocalDate endDate = parseDate(dates.path("end").path("localDate").asText(null));
            if (startDate == null) return null;
            if (endDate == null) endDate = startDate;
            String startTime = dates.path("start").path("localTime").asText("");
            // Trim seconds if Ticketmaster returned HH:mm:ss
            if (startTime.length() > 5) startTime = startTime.substring(0, 5);

            String category = mapCategory(n);

            JsonNode venueNode = n.path("_embedded").path("venues");
            String venue = "";
            String neighbourhood = "";
            if (venueNode.isArray() && !venueNode.isEmpty()) {
                JsonNode v = venueNode.get(0);
                venue = v.path("name").asText("");
                neighbourhood = v.path("city").path("name").asText("");
            }

            Image image = pickImage(n.path("images"));
            String ticketUrl = emptyToNull(n.path("url").asText(""));
            BigDecimal priceFrom = pickPrice(n.path("priceRanges"));

            String description = n.path("info").asText("");
            if (description.isBlank()) description = n.path("pleaseNote").asText("");
            if (description.isBlank()) description = title;

            String tagline = deriveTagline(n, title);

            return new Event(
                    id,
                    title,
                    category,
                    startDate,
                    endDate,
                    startTime,
                    venue,
                    neighbourhood,
                    trim(description, 280),
                    trim(tagline, 80),
                    image,
                    ticketUrl,
                    priceFrom,
                    featured
            );
        } catch (Exception ex) {
            log.debug("Skipping malformed Ticketmaster event: {}", ex.getMessage());
            return null;
        }
    }

    /**
     * Map Ticketmaster's "classifications.segment" (Music, Sports,
     * Arts & Theatre, Miscellaneous, etc.) onto our event category
     * enum.
     */
    private String mapCategory(JsonNode event) {
        JsonNode segments = event.path("classifications");
        if (!segments.isArray() || segments.isEmpty()) return "cultural";
        String segment = segments.get(0).path("segment").path("name").asText("").toLowerCase();
        return switch (segment) {
            case "music" -> "music";
            case "sports" -> "sports";
            case "arts & theatre" -> "cultural";
            case "film" -> "cultural";
            case "family" -> "festival";
            case "food & drink" -> "food";
            default -> "cultural";
        };
    }

    /** Pick the largest 16:9-ish image Ticketmaster gives us. */
    private Image pickImage(JsonNode images) {
        if (!images.isArray() || images.isEmpty()) return null;
        JsonNode best = null;
        int bestWidth = 0;
        for (JsonNode img : images) {
            int w = img.path("width").asInt(0);
            String ratio = img.path("ratio").asText("");
            boolean wide = "16_9".equals(ratio) || "3_2".equals(ratio);
            if (wide && w > bestWidth) {
                best = img;
                bestWidth = w;
            }
        }
        if (best == null) best = images.get(0);
        String url = best.path("url").asText("");
        if (url.isBlank()) return null;
        return new Image(url, "", "Ticketmaster");
    }

    private BigDecimal pickPrice(JsonNode priceRanges) {
        if (!priceRanges.isArray() || priceRanges.isEmpty()) return null;
        double min = priceRanges.get(0).path("min").asDouble(-1);
        return min >= 0 ? BigDecimal.valueOf(min) : null;
    }

    private String deriveTagline(JsonNode n, String fallback) {
        JsonNode classifications = n.path("classifications");
        if (classifications.isArray() && !classifications.isEmpty()) {
            String segment = classifications.get(0).path("segment").path("name").asText("");
            String genre = classifications.get(0).path("genre").path("name").asText("");
            if (!genre.isBlank() && !"Undefined".equalsIgnoreCase(genre)) {
                return segment.isBlank() ? genre : segment + " · " + genre;
            }
            if (!segment.isBlank()) return segment;
        }
        return fallback;
    }

    private LocalDate parseDate(String s) {
        if (s == null || s.isBlank()) return null;
        try { return LocalDate.parse(s); } catch (Exception e) { return null; }
    }

    private String emptyToNull(String s) { return s == null || s.isBlank() ? null : s; }

    private String trim(String s, int max) {
        if (s == null) return "";
        if (s.length() <= max) return s;
        return s.substring(0, max - 1).trim() + "…";
    }

    private RestClient http() {
        if (client == null) {
            client = RestClient.builder()
                    .baseUrl(properties.getTicketmaster().getBaseUrl())
                    .build();
        }
        return client;
    }
}
