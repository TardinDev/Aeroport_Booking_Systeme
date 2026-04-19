package com.skybooker.dto.response;

import com.skybooker.enums.FlightStatus;

import java.math.BigDecimal;
import java.time.Instant;

public record FlightResponse(
        Long id,
        String flightNumber,
        AirlineResponse airline,
        AirportResponse origin,
        AirportResponse destination,
        Instant departureTime,
        Instant arrivalTime,
        BigDecimal basePrice,
        int availableSeats,
        FlightStatus status
) {}
