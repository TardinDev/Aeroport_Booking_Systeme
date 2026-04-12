package com.skybooker.dto.response;

import com.skybooker.enums.UserRole;

import java.util.UUID;

public record UserResponse(
        UUID id,
        String email,
        String firstName,
        String lastName,
        String phone,
        UserRole role,
        String avatarUrl
) {}
