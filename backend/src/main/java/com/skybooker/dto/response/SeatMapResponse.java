package com.skybooker.dto.response;

import java.util.List;
import java.util.UUID;

public record SeatMapResponse(
        UUID flightId,
        String flightNumber,
        List<SeatResponse> seats,
        int totalSeats,
        int availableSeats
) {}
