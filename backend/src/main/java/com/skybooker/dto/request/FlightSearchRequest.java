package com.skybooker.dto.request;

import com.skybooker.enums.SeatClass;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record FlightSearchRequest(
        @Schema(description = "IATA code of origin airport", example = "CDG")
        @NotBlank @Size(min = 3, max = 3)
        String origin,

        @Schema(description = "IATA code of destination airport", example = "JFK")
        @NotBlank @Size(min = 3, max = 3)
        String destination,

        @Schema(description = "Departure day (ISO local date)", example = "2026-05-15")
        @NotNull
        LocalDate departureDate,

        @Schema(description = "Number of passengers", example = "1")
        @NotNull @Min(1)
        Integer passengers,

        @Schema(description = "Seat class filter — returns flights that have seats of this class available")
        SeatClass seatClass
) {}
