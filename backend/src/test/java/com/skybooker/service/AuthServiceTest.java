package com.skybooker.service;

import com.skybooker.dto.request.LoginRequest;
import com.skybooker.dto.request.RegisterRequest;
import com.skybooker.dto.response.AuthResponse;
import com.skybooker.dto.response.UserResponse;
import com.skybooker.entity.User;
import com.skybooker.enums.Role;
import com.skybooker.exception.ConflictException;
import com.skybooker.mapper.UserMapper;
import com.skybooker.repository.UserRepository;
import com.skybooker.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock UserRepository userRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock AuthenticationManager authenticationManager;
    @Mock JwtTokenProvider tokenProvider;
    @Mock UserMapper userMapper;

    @InjectMocks AuthService authService;

    private User savedUser;

    @BeforeEach
    void setUp() {
        savedUser = User.builder()
                .id(42L)
                .email("alice@example.com")
                .passwordHash("hashed")
                .firstName("Alice")
                .lastName("Martin")
                .role(Role.USER)
                .enabled(true)
                .createdAt(Instant.now())
                .build();
    }

    @Test
    void register_createsUserAndReturnsTokens() {
        RegisterRequest request = new RegisterRequest("Alice@example.com", "strongPass1!", "Alice", "Martin");

        when(userRepository.existsByEmailIgnoreCase("Alice@example.com")).thenReturn(false);
        when(passwordEncoder.encode("strongPass1!")).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(tokenProvider.generateAccessToken(savedUser)).thenReturn("access-token");
        when(tokenProvider.generateRefreshToken(savedUser)).thenReturn("refresh-token");
        when(userMapper.toResponse(savedUser)).thenReturn(
                new UserResponse(42L, "alice@example.com", "Alice", "Martin", Role.USER));

        AuthResponse response = authService.register(request);

        assertThat(response.accessToken()).isEqualTo("access-token");
        assertThat(response.refreshToken()).isEqualTo("refresh-token");
        assertThat(response.user().email()).isEqualTo("alice@example.com");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_throwsWhenEmailAlreadyExists() {
        RegisterRequest request = new RegisterRequest("alice@example.com", "strongPass1!", "Alice", "Martin");
        when(userRepository.existsByEmailIgnoreCase("alice@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("already registered");
    }

    @Test
    void login_authenticatesAndReturnsTokens() {
        LoginRequest request = new LoginRequest("alice@example.com", "strongPass1!");
        Authentication stubAuth = mock(Authentication.class);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(stubAuth);
        when(userRepository.findByEmailIgnoreCase("alice@example.com")).thenReturn(Optional.of(savedUser));
        when(tokenProvider.generateAccessToken(savedUser)).thenReturn("access-token");
        when(tokenProvider.generateRefreshToken(savedUser)).thenReturn("refresh-token");
        when(userMapper.toResponse(eq(savedUser))).thenReturn(
                new UserResponse(42L, "alice@example.com", "Alice", "Martin", Role.USER));

        AuthResponse response = authService.login(request);

        assertThat(response.user().id()).isEqualTo(42L);
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        // passwordEncoder is not invoked during login (AuthenticationManager handles hashing)
        verify(passwordEncoder, org.mockito.Mockito.never()).encode(anyString());
    }
}
