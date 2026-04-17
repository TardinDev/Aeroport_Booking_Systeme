package com.skybooker.service.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.skybooker.config.IntegrationsProperties;
import com.skybooker.dto.response.DestinationEventsResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Optional;

/**
 * Unsplash search wrapper — flag-gated, returns a single landscape
 * photo matching the query plus proper attribution (per Unsplash TOS).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UnsplashClient {

    private final IntegrationsProperties properties;
    private RestClient client;

    public boolean isEnabled() {
        return properties.getUnsplash().isEnabled()
                && !properties.getUnsplash().getAccessKey().isBlank();
    }

    public Optional<DestinationEventsResponse.Image> searchHeroImage(String query) {
        if (!isEnabled() || query == null || query.isBlank()) return Optional.empty();
        try {
            JsonNode node = http()
                    .get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/search/photos")
                            .queryParam("query", query)
                            .queryParam("orientation", "landscape")
                            .queryParam("per_page", 1)
                            .queryParam("content_filter", "high")
                            .build())
                    .header("Authorization", "Client-ID " + properties.getUnsplash().getAccessKey())
                    .header("Accept-Version", "v1")
                    .retrieve()
                    .body(JsonNode.class);

            if (node == null) return Optional.empty();
            JsonNode results = node.path("results");
            if (!results.isArray() || results.isEmpty()) return Optional.empty();

            JsonNode photo = results.get(0);
            String url = photo.path("urls").path("regular").asText("");
            if (url.isBlank()) return Optional.empty();

            String alt = photo.path("alt_description").asText(query);
            String author = photo.path("user").path("name").asText("Unsplash");
            String credit = "Unsplash · " + author;

            return Optional.of(new DestinationEventsResponse.Image(url, alt, credit));
        } catch (Exception e) {
            log.debug("Unsplash search failed for {}: {}", query, e.getMessage());
            return Optional.empty();
        }
    }

    private RestClient http() {
        if (client == null) {
            client = RestClient.builder()
                    .baseUrl(properties.getUnsplash().getBaseUrl())
                    .build();
        }
        return client;
    }
}
