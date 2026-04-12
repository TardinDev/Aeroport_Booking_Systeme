package com.skybooker.controller;

import com.skybooker.dto.response.UserResponse;
import com.skybooker.entity.User;
import com.skybooker.exception.ResourceNotFoundException;
import com.skybooker.mapper.UserMapper;
import com.skybooker.repository.UserRepository;
import com.skybooker.security.SecurityUserDetails;
import com.skybooker.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User profile management")
public class UserController {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final AuthService authService;

    @GetMapping("/me")
    @Operation(summary = "Get current user profile")
    public ResponseEntity<UserResponse> getCurrentUser() {
        UserResponse response = authService.getCurrentUser();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/me")
    @Operation(summary = "Update current user profile")
    public ResponseEntity<UserResponse> updateCurrentUser(@RequestBody Map<String, String> updates) {
        SecurityUserDetails currentUser = authService.getAuthenticatedUser();
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUser.getId()));

        if (updates.containsKey("firstName")) {
            user.setFirstName(updates.get("firstName"));
        }
        if (updates.containsKey("lastName")) {
            user.setLastName(updates.get("lastName"));
        }
        if (updates.containsKey("phone")) {
            user.setPhone(updates.get("phone"));
        }
        if (updates.containsKey("avatarUrl")) {
            user.setAvatarUrl(updates.get("avatarUrl"));
        }

        user = userRepository.save(user);
        return ResponseEntity.ok(userMapper.toResponse(user));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all users (admin only)")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<UserResponse> users = userRepository.findAll().stream()
                .map(userMapper::toResponse)
                .toList();
        return ResponseEntity.ok(users);
    }
}
