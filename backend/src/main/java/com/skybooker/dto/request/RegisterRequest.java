package com.skybooker.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @Schema(description = "User's email address", example = "alice@example.com")
        @NotBlank @Email @Size(max = 254)
        String email,

        @Schema(description = "Clear-text password, min 8 chars", example = "MyStrongPw!1")
        @NotBlank @Size(min = 8, max = 72)
        String password,

        @Schema(example = "Alice")
        @NotBlank @Size(max = 80)
        String firstName,

        @Schema(example = "Martin")
        @NotBlank @Size(max = 80)
        String lastName
) {}
