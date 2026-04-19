package com.skybooker.dto.response;

public record AirportResponse(
        Long id,
        String iataCode,
        String name,
        String city,
        String country
) {}
