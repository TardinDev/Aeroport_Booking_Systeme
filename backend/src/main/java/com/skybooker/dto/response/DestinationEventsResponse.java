package com.skybooker.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record DestinationEventsResponse(
        String iata,
        String city,
        String country,
        Image heroImage,
        List<Event> events,
        String source,
        Instant generatedAt
) {
    public record Image(
            String url,
            String alt,
            String credit
    ) {}

    public record Event(
            String id,
            String title,
            String category,
            LocalDate startDate,
            LocalDate endDate,
            String startTime,
            String venue,
            String neighbourhood,
            String description,
            String tagline,
            Image image,
            String ticketUrl,
            BigDecimal priceFromEur,
            boolean featured
    ) {}
}
