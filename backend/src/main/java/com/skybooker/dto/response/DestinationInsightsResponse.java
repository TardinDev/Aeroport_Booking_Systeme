package com.skybooker.dto.response;

import java.time.Instant;
import java.util.List;

public record DestinationInsightsResponse(
        String iata,
        String city,
        String country,
        String tagline,
        SafetySnapshot safety,
        List<CurrentEvent> events,
        List<Experience> mustDo,
        List<DailyTip> dailyTips,
        TravelPractical practical,
        String source,
        Instant generatedAt
) {
    public record SafetySnapshot(
            String level,
            String summary,
            List<String> watchouts
    ) {}

    public record CurrentEvent(
            String title,
            String window,
            String location,
            String description
    ) {}

    public record Experience(
            String title,
            String category,
            String description,
            String neighbourhood
    ) {}

    public record DailyTip(
            String icon,
            String title,
            String detail
    ) {}

    public record TravelPractical(
            String currency,
            String language,
            String timezone,
            String plug,
            String tipping,
            String transportTip
    ) {}
}
