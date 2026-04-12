package com.skybooker.dto.request;

import com.skybooker.enums.BaggageType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.util.UUID;

public record BaggageRequest(
        @NotNull(message = "Booking ID is required")
        UUID bookingId,

        @NotNull(message = "Baggage type is required")
        BaggageType type,

        @Positive(message = "Weight must be positive")
        double weight,

        String dimensions
) {}
