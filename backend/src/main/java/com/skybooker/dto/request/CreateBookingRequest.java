package com.skybooker.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CreateBookingRequest(
        @Schema(description = "Target flight identifier", example = "7")
        @NotNull
        Long flightId,

        @Schema(description = "Passengers to book — at least one")
        @NotEmpty @Size(max = 9) @Valid
        List<PassengerRequest> passengers,

        @Schema(description = "Seat IDs to assign. Must match passenger count 1-to-1.")
        @NotEmpty @Size(max = 9)
        List<Long> seatIds
) {}
