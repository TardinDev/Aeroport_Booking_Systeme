package com.skybooker.controller;

import com.skybooker.dto.request.FlightSearchRequest;
import com.skybooker.dto.response.FlightResponse;
import com.skybooker.dto.response.SeatResponse;
import com.skybooker.enums.SeatClass;
import com.skybooker.service.FlightService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@Tag(name = "Flights", description = "Search flights and inspect seat maps")
@RestController
@RequestMapping("/api/v1/flights")
public class FlightController {

    private final FlightService flightService;

    public FlightController(FlightService flightService) {
        this.flightService = flightService;
    }

    @Operation(summary = "Search flights by origin, destination, date and passenger count")
    @GetMapping("/search")
    public List<FlightResponse> search(
            @RequestParam @NotBlank @Size(min = 3, max = 3) @Parameter(example = "CDG") String origin,
            @RequestParam @NotBlank @Size(min = 3, max = 3) @Parameter(example = "JFK") String destination,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) @Parameter(example = "2026-05-15") LocalDate departureDate,
            @RequestParam(defaultValue = "1") @Min(1) Integer passengers,
            @RequestParam(required = false) SeatClass seatClass) {

        FlightSearchRequest request = new FlightSearchRequest(origin, destination, departureDate, passengers, seatClass);
        return flightService.searchFlights(request);
    }

    @Operation(summary = "Fetch a single flight by id")
    @GetMapping("/{id}")
    public FlightResponse getById(@PathVariable Long id) {
        return flightService.getFlightById(id);
    }

    @Operation(summary = "Return the seat map of a flight with per-seat status and price")
    @GetMapping("/{id}/seats")
    public List<SeatResponse> getSeats(@PathVariable Long id) {
        return flightService.getSeatsByFlightId(id);
    }
}
