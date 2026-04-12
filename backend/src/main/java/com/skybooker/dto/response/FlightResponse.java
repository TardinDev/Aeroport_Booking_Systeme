package com.skybooker.dto.response;

import com.skybooker.enums.FlightStatus;
import com.skybooker.enums.SeatClass;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record FlightResponse(
        UUID id,
        String flightNumber,
        String airlineName,
        String airlineCode,
        String airlineLogo,
        String originCode,
        String originName,
        String originCity,
        String originCountry,
        String destinationCode,
        String destinationName,
        String destinationCity,
        String destinationCountry,
        LocalDateTime departureTime,
        LocalDateTime arrivalTime,
        int duration,
        BigDecimal basePrice,
        String currency,
        SeatClass seatClass,
        int totalSeats,
        int availableSeats,
        FlightStatus status,
        int stops,
        String bookingUrl,
        String sellerName,
        String sellerType,
        String sellerLogoUrl
) {}
