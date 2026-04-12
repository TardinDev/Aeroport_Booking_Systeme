package com.skybooker.dto.request;

import com.skybooker.enums.SeatClass;

import java.time.LocalDate;

public record FlightSearchRequest(
        String origin,
        String destination,
        LocalDate departureDate,
        LocalDate returnDate,
        Integer passengers,
        SeatClass seatClass,
        String tripType
) {
    public FlightSearchRequest {
        if (passengers == null) passengers = 1;
        if (tripType == null) tripType = "one-way";
    }
}
