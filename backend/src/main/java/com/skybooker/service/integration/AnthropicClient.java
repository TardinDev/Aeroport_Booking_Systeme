package com.skybooker.service.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skybooker.config.IntegrationsProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Minimal Claude Messages API client. Flag-gated behind
 * {@code skybooker.integrations.ai.enabled}. Uses prompt caching
 * (ephemeral cache control) on the system prompt so repeated insight
 * generations for the same destination hit cache.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AnthropicClient {

    private final IntegrationsProperties properties;
    private final ObjectMapper mapper = new ObjectMapper();

    private RestClient client;

    public boolean isEnabled() {
        return properties.getAi().isEnabled()
                && !properties.getAi().getApiKey().isBlank();
    }

    /**
     * Runs a JSON-mode message call and returns the model's raw text content.
     * Caller is expected to parse the JSON.
     */
    public Optional<String> completeJson(String systemPrompt, String userPrompt) {
        if (!isEnabled()) return Optional.empty();
        try {
            Map<String, Object> body = Map.of(
                    "model", properties.getAi().getModel(),
                    "max_tokens", properties.getAi().getMaxTokens(),
                    "system", List.of(Map.of(
                            "type", "text",
                            "text", systemPrompt,
                            "cache_control", Map.of("type", "ephemeral")
                    )),
                    "messages", List.of(Map.of(
                            "role", "user",
                            "content", userPrompt
                    ))
            );

            JsonNode response = http()
                    .post()
                    .uri("/v1/messages")
                    .header("x-api-key", properties.getAi().getApiKey())
                    .header("anthropic-version", "2023-06-01")
                    .header("content-type", "application/json")
                    .body(body)
                    .retrieve()
                    .body(JsonNode.class);

            if (response == null) return Optional.empty();
            JsonNode content = response.path("content");
            if (!content.isArray() || content.isEmpty()) return Optional.empty();
            String text = content.get(0).path("text").asText(null);
            return Optional.ofNullable(text);
        } catch (Exception e) {
            log.warn("Anthropic call failed: {}", e.getMessage());
            return Optional.empty();
        }
    }

    private RestClient http() {
        if (client == null) {
            client = RestClient.builder()
                    .baseUrl(properties.getAi().getBaseUrl())
                    .build();
        }
        return client;
    }
}
