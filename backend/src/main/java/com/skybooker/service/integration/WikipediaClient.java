package com.skybooker.service.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.skybooker.config.IntegrationsProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Optional;
import java.util.Set;

/**
 * Wikipedia REST API wrapper — returns a short extract and a main
 * image for a given city. No API key required; rate-limited by
 * Wikipedia's own policies but cached aggressively in Redis.
 *
 * Language is picked at call time so the extract matches the user's
 * selected UI language (fr → fr.wikipedia.org, en → en.wikipedia.org,
 * etc.). Unsupported languages fall back to English.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class WikipediaClient {

    private static final Set<String> SUPPORTED_LANGS =
            Set.of("en", "fr", "es", "zh", "de", "it", "pt", "ja");

    private final IntegrationsProperties properties;

    public boolean isEnabled() {
        return properties.getWikipedia().isEnabled();
    }

    public Optional<Summary> getSummary(String city, String lang) {
        if (!isEnabled() || city == null || city.isBlank()) {
            return Optional.empty();
        }
        String chosenLang = SUPPORTED_LANGS.contains(lang) ? lang : "en";
        String baseUrl = properties.getWikipedia().getBaseUrl().replace("{lang}", chosenLang);
        String encoded = URLEncoder.encode(city.replace(' ', '_'), StandardCharsets.UTF_8);

        try {
            JsonNode node = RestClient.builder()
                    .baseUrl(baseUrl)
                    .build()
                    .get()
                    .uri("/page/summary/{title}", encoded)
                    .header("User-Agent", "SkyBooker/1.0 (https://skybooker.app)")
                    .header("accept", "application/json")
                    .retrieve()
                    .body(JsonNode.class);

            if (node == null) return Optional.empty();

            // Skip disambiguation / not-found responses — the extract
            // would be a list of links, not useful copy.
            String type = node.path("type").asText("");
            if ("disambiguation".equals(type) || "not_found".equals(type)) {
                return Optional.empty();
            }

            String extract = node.path("extract").asText("");
            if (extract.isBlank()) return Optional.empty();

            JsonNode image = node.path("originalimage").isMissingNode()
                    ? node.path("thumbnail")
                    : node.path("originalimage");
            String imageUrl = image.path("source").asText("");

            return Optional.of(new Summary(
                    node.path("title").asText(city),
                    extract,
                    imageUrl.isBlank() ? null : imageUrl,
                    node.path("content_urls").path("desktop").path("page").asText(""),
                    chosenLang
            ));
        } catch (Exception e) {
            log.debug("Wikipedia lookup failed for {}/{}: {}", chosenLang, city, e.getMessage());
            return Optional.empty();
        }
    }

    public record Summary(
            String title,
            String extract,
            String imageUrl,
            String pageUrl,
            String language
    ) {}
}
