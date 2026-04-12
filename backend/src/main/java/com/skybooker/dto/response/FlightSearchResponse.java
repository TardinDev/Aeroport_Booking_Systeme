package com.skybooker.dto.response;

import java.util.List;

public record FlightSearchResponse(
        List<FlightResponse> flights,
        long totalResults,
        int page,
        int pageSize,
        int totalPages
) {}
