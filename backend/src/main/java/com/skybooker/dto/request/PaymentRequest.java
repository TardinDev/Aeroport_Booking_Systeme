package com.skybooker.dto.request;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record PaymentRequest(
        @NotNull(message = "Booking ID is required")
        UUID bookingId,

        String paymentMethodId
) {}
