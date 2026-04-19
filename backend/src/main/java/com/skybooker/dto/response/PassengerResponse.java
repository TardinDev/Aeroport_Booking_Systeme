package com.skybooker.dto.response;

public record PassengerResponse(
        Long id,
        String firstName,
        String lastName,
        SeatResponse seat
) {}
