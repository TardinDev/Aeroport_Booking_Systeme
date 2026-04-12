package com.skybooker.dto.response;

import com.skybooker.enums.BookingStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record BookingResponse(
        UUID id,
        String bookingReference,
        FlightResponse flight,
        BookingStatus status,
        BigDecimal totalPrice,
        String currency,
        List<PassengerResponse> passengers,
        String paymentStatus,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public record PassengerResponse(
            UUID id,
            String firstName,
            String lastName,
            String email,
            String phone,
            String passportNumber,
            SeatResponse seat
    ) {}
}
