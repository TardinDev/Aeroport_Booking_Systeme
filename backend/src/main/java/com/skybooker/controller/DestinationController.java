package com.skybooker.controller;

import com.skybooker.dto.response.DestinationEventsResponse;
import com.skybooker.dto.response.DestinationInsightsResponse;
import com.skybooker.service.DestinationEventsService;
import com.skybooker.service.DestinationInsightsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/destinations")
@RequiredArgsConstructor
@Tag(name = "Destinations", description = "AI-powered destination concierge")
public class DestinationController {

    private final DestinationInsightsService insightsService;
    private final DestinationEventsService eventsService;

    @GetMapping("/{iata}/insights")
    @Operation(summary = "Safety, events, things to do and daily tips for a destination")
    public ResponseEntity<DestinationInsightsResponse> getInsights(@PathVariable String iata) {
        return ResponseEntity.ok(insightsService.getInsights(iata));
    }

    @GetMapping("/{iata}/events")
    @Operation(summary = "What's on in the destination — rich events with images and dates")
    public ResponseEntity<DestinationEventsResponse> getEvents(@PathVariable String iata) {
        return ResponseEntity.ok(eventsService.getEvents(iata));
    }
}
