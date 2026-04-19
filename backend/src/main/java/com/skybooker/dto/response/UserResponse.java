package com.skybooker.dto.response;

import com.skybooker.enums.Role;

public record UserResponse(
        Long id,
        String email,
        String firstName,
        String lastName,
        Role role
) {}
