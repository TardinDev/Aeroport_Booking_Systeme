package com.skybooker.service.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.skybooker.config.IntegrationsProperties;
import com.skybooker.service.flight.CityDirectory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * OpenTripMap — points of interest around a lat/lng. Flag-gated.
 * Feeds the "must do" list in destination insights with real
 * museums, monuments, parks etc. pulled from OpenStreetMap data.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OpenTripMapClient {

    private final IntegrationsProperties properties;
    private RestClient client;

    public boolean isEnabled() {
        return properties.getOpentripmap().isEnabled()
                && !properties.getOpentripmap().getApiKey().isBlank();
    }

    public Optional<List<Poi>> topPois(CityDirectory.AirportRef airport, String lang) {
        if (!isEnabled()) return Optional.empty();
        if (airport.lat() == 0.0 && airport.lng() == 0.0) return Optional.empty();
        try {
            String chosenLang = switch (lang) {
                case "fr", "es", "de", "it", "ja", "ru" -> lang;
                default -> "en";
            };

            JsonNode node = http()
                    .get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/" + chosenLang + "/places/radius")
                            .queryParam("radius", 15000) // 15km around the city's airport lat/lng
                            .queryParam("lon", airport.lng())
                            .queryParam("lat", airport.lat())
                            .queryParam("rate", "3") // high-importance only (1=low, 3=high, h=heritage)
                            .queryParam("kinds",
                                    "cultural,historic,architecture,museums,monuments_and_memorials,urban_environment")
                            .queryParam("format", "json")
                            .queryParam("limit", 8)
                            .queryParam("apikey", properties.getOpentripmap().getApiKey())
                            .build())
                    .header("Accept", "application/json")
                    .retrieve()
                    .body(JsonNode.class);

            if (node == null || !node.isArray() || node.isEmpty()) return Optional.empty();

            List<Poi> out = new ArrayList<>();
            for (JsonNode n : node) {
                String name = n.path("name").asText("");
                if (name.isBlank()) continue;
                String kinds = n.path("kinds").asText("");
                out.add(new Poi(
                        n.path("xid").asText(""),
                        name,
                        humanizeKind(kinds),
                        n.path("rate").asInt(0)
                ));
            }
            return Optional.of(out);
        } catch (Exception e) {
            log.debug("OpenTripMap lookup failed: {}", e.getMessage());
            return Optional.empty();
        }
    }

    private String humanizeKind(String kinds) {
        if (kinds == null || kinds.isBlank()) return "cultural";
        // Kinds comes as a comma-list; pick the first meaningful tag.
        String first = kinds.split(",")[0].replace("_", " ");
        return switch (first) {
            case "museums" -> "culture";
            case "historic", "historic architecture" -> "culture";
            case "urban environment" -> "nature";
            case "natural" -> "nature";
            default -> "culture";
        };
    }

    public record Poi(String xid, String name, String category, int rate) {}

    private RestClient http() {
        if (client == null) {
            client = RestClient.builder()
                    .baseUrl(properties.getOpentripmap().getBaseUrl())
                    .build();
        }
        return client;
    }
}
