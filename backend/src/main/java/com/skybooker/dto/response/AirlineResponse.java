package com.skybooker.dto.response;

public record AirlineResponse(
        Long id,
        String iataCode,
        String name
) {}
