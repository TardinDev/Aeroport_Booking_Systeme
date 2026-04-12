package com.skybooker.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.UUID;

public record TaxiRequest(
        @NotNull(message = "Booking ID is required")
        UUID bookingId,

        @NotBlank(message = "Pickup address is required")
        String pickupAddress,

        Double pickupLat,
        Double pickupLng,

        @NotNull(message = "Pickup time is required")
        LocalDateTime pickupTime
) {}
