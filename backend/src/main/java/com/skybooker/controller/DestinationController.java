package com.skybooker.controller;

import com.skybooker.dto.response.DestinationEventsResponse;
import com.skybooker.dto.response.DestinationInsightsResponse;
import com.skybooker.service.DestinationEventsService;
import com.skybooker.service.DestinationInsightsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Set;

@RestController
@RequestMapping("/api/v1/destinations")
@RequiredArgsConstructor
@Tag(name = "Destinations", description = "AI-powered destination concierge")
public class DestinationController {

    private static final Set<String> SUPPORTED_LANGS = Set.of("en", "fr", "es", "zh");

    private final DestinationInsightsService insightsService;
    private final DestinationEventsService eventsService;

    @GetMapping("/{iata}/insights")
    @Operation(summary = "Safety, events, things to do and daily tips for a destination")
    public ResponseEntity<DestinationInsightsResponse> getInsights(
            @PathVariable String iata,
            @RequestHeader(value = HttpHeaders.ACCEPT_LANGUAGE, required = false) String acceptLanguage
    ) {
        return ResponseEntity.ok(insightsService.getInsights(iata, pickLang(acceptLanguage)));
    }

    @GetMapping("/{iata}/events")
    @Operation(summary = "What's on in the destination — rich events with images and dates")
    public ResponseEntity<DestinationEventsResponse> getEvents(
            @PathVariable String iata,
            @RequestHeader(value = HttpHeaders.ACCEPT_LANGUAGE, required = false) String acceptLanguage
    ) {
        return ResponseEntity.ok(eventsService.getEvents(iata, pickLang(acceptLanguage)));
    }

    /**
     * Parse an Accept-Language header into one of our supported codes.
     * Falls back to English.
     */
    private String pickLang(String header) {
        if (header == null || header.isBlank()) return "en";
        String primary = header.split(",")[0].trim().toLowerCase();
        String two = primary.length() >= 2 ? primary.substring(0, 2) : "en";
        return SUPPORTED_LANGS.contains(two) ? two : "en";
    }
}
