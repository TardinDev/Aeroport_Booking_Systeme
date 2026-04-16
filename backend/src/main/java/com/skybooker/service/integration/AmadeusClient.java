package com.skybooker.service.integration;

import com.skybooker.config.IntegrationsProperties;
import com.skybooker.dto.response.FlightResponse;
import com.skybooker.enums.SeatClass;
import com.skybooker.service.flight.FlightGeneratorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Thin Amadeus Self-Service wrapper. Guarded by {@code skybooker.integrations.amadeus.enabled}.
 * When the flag is off, callers get {@link Optional#empty()} and the caller
 * should fall back to {@link FlightGeneratorService} for demo data.
 *
 * Real calls are OAuth2 client-credentials → Flight Offers Search v2.
 * Left intentionally partial: the response mapping is a TODO until a real
 * sandbox key is wired in; enabling the flag without that wiring will log
 * and return empty rather than crash the app.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AmadeusClient {

    private final IntegrationsProperties properties;

    private RestClient client;
    private String cachedToken;
    private Instant tokenExpiry = Instant.EPOCH;

    public boolean isEnabled() {
        return properties.getAmadeus().isEnabled()
                && !properties.getAmadeus().getApiKey().isBlank()
                && !properties.getAmadeus().getApiSecret().isBlank();
    }

    public Optional<List<FlightResponse>> searchOffers(
            String origin,
            String destination,
            LocalDate date,
            SeatClass seatClass,
            int passengers,
            int limit
    ) {
        if (!isEnabled()) return Optional.empty();
        try {
            String token = ensureToken();
            var http = http();
            // TODO: map Amadeus flight-offers-search v2 JSON into FlightResponse.
            //   Shape: GET /v2/shopping/flight-offers?originLocationCode=&destinationLocationCode=
            //          &departureDate=&adults=&travelClass=&currencyCode=EUR&max=
            //   Once a sandbox key is available, implement the parser and return
            //   the mapped list; for now keep behaviour identical to stub mode.
            log.debug("Amadeus enabled but mapping not yet implemented — returning empty");
            return Optional.empty();
        } catch (Exception e) {
            log.warn("Amadeus call failed ({}→{}): {}", origin, destination, e.getMessage());
            return Optional.empty();
        }
    }

    private RestClient http() {
        if (client == null) {
            client = RestClient.builder()
                    .baseUrl(properties.getAmadeus().getBaseUrl())
                    .build();
        }
        return client;
    }

    private String ensureToken() {
        if (cachedToken != null && Instant.now().isBefore(tokenExpiry)) {
            return cachedToken;
        }
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "client_credentials");
        body.add("client_id", properties.getAmadeus().getApiKey());
        body.add("client_secret", properties.getAmadeus().getApiSecret());

        @SuppressWarnings("unchecked")
        Map<String, Object> response = http()
                .post()
                .uri("/v1/security/oauth2/token")
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_FORM_URLENCODED_VALUE)
                .body(body)
                .retrieve()
                .body(Map.class);

        if (response == null || response.get("access_token") == null) {
            throw new IllegalStateException("Amadeus token response missing access_token");
        }
        cachedToken = response.get("access_token").toString();
        int expiresIn = response.get("expires_in") instanceof Number n ? n.intValue() : 1500;
        tokenExpiry = Instant.now().plusSeconds(expiresIn - 60L);
        return cachedToken;
    }
}
