package com.skybooker.controller;

import com.skybooker.dto.response.UserResponse;
import com.skybooker.exception.ResourceNotFoundException;
import com.skybooker.mapper.UserMapper;
import com.skybooker.repository.UserRepository;
import com.skybooker.security.CurrentUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Users", description = "Authenticated user profile")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    public UserController(UserRepository userRepository, UserMapper userMapper) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
    }

    @Operation(summary = "Return the currently authenticated user")
    @GetMapping("/me")
    @Transactional(readOnly = true)
    public UserResponse me(Authentication authentication) {
        Long userId = CurrentUser.userId(authentication);
        return userRepository.findById(userId)
                .map(userMapper::toResponse)
                .orElseThrow(() -> ResourceNotFoundException.of("User", userId));
    }
}
