package com.skybooker.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record BookingRequest(
        @NotNull(message = "Flight ID is required")
        UUID flightId,

        @NotEmpty(message = "At least one passenger is required")
        @Valid
        List<PassengerInfo> passengers,

        List<UUID> selectedSeatIds,

        List<String> services
) {
    public record PassengerInfo(
            @NotNull(message = "First name is required")
            String firstName,

            @NotNull(message = "Last name is required")
            String lastName,

            String email,
            String phone,
            String dateOfBirth,
            String passportNumber
    ) {}
}
