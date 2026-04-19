package com.skybooker.security;

import com.skybooker.enums.Role;
import com.skybooker.exception.ForbiddenException;
import org.springframework.security.core.Authentication;

public final class CurrentUser {

    private CurrentUser() {}

    public static JwtAuthenticationFilter.AuthenticatedUser require(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof JwtAuthenticationFilter.AuthenticatedUser principal)) {
            throw new ForbiddenException("Authentication required");
        }
        return principal;
    }

    public static Long userId(Authentication authentication) {
        return require(authentication).id();
    }

    public static Role role(Authentication authentication) {
        return Role.valueOf(require(authentication).role());
    }
}
