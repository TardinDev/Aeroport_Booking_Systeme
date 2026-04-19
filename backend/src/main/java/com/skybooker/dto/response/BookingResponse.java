package com.skybooker.dto.response;

import com.skybooker.enums.BookingStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record BookingResponse(
        Long id,
        String bookingReference,
        FlightResponse flight,
        List<PassengerResponse> passengers,
        BookingStatus status,
        BigDecimal totalPrice,
        Instant createdAt
) {}
