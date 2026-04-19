package com.skybooker.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record PassengerRequest(
        @Schema(example = "Alice")
        @NotBlank @Size(max = 80)
        String firstName,

        @Schema(example = "Martin")
        @NotBlank @Size(max = 80)
        String lastName,

        @Schema(example = "1992-07-14")
        @NotNull @Past
        LocalDate dateOfBirth,

        @Schema(example = "FRX1234567")
        @NotBlank @Size(max = 20)
        String passportNumber
) {}
