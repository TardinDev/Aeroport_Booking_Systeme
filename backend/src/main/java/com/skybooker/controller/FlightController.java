package com.skybooker.controller;

import com.skybooker.dto.request.FlightSearchRequest;
import com.skybooker.dto.response.FlightResponse;
import com.skybooker.dto.response.FlightSearchResponse;
import com.skybooker.dto.response.SeatMapResponse;
import com.skybooker.enums.SeatClass;
import com.skybooker.service.FlightService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/flights")
@RequiredArgsConstructor
@Tag(name = "Flights", description = "Flight search and information endpoints")
public class FlightController {

    private final FlightService flightService;

    @GetMapping("/search")
    @Operation(summary = "Search for available flights")
    public ResponseEntity<FlightSearchResponse> searchFlights(
            @RequestParam(required = false) String origin,
            @RequestParam(required = false) String destination,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate departureDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate returnDate,
            @RequestParam(defaultValue = "1") Integer passengers,
            @RequestParam(required = false) SeatClass seatClass,
            @RequestParam(defaultValue = "one-way") String tripType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        FlightSearchRequest request = new FlightSearchRequest(
                origin, destination, departureDate, returnDate, passengers, seatClass, tripType
        );
        FlightSearchResponse response = flightService.searchFlights(request, page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get flight details by ID")
    public ResponseEntity<FlightResponse> getFlightById(@PathVariable UUID id) {
        FlightResponse response = flightService.getFlightById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/seats")
    @Operation(summary = "Get seat map for a specific flight")
    public ResponseEntity<SeatMapResponse> getFlightSeats(@PathVariable UUID id) {
        SeatMapResponse response = flightService.getFlightSeats(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new flight (admin only)")
    public ResponseEntity<FlightResponse> createFlight(@RequestBody com.skybooker.entity.Flight flight) {
        FlightResponse response = flightService.createFlight(flight);
        return ResponseEntity.status(201).body(response);
    }
}
