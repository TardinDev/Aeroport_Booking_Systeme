package com.skybooker.service;

import com.skybooker.dto.request.LoginRequest;
import com.skybooker.dto.request.RegisterRequest;
import com.skybooker.dto.response.AuthResponse;
import com.skybooker.dto.response.UserResponse;
import com.skybooker.entity.User;
import com.skybooker.enums.UserRole;
import com.skybooker.exception.BadRequestException;
import com.skybooker.exception.UnauthorizedException;
import com.skybooker.mapper.UserMapper;
import com.skybooker.repository.UserRepository;
import com.skybooker.security.SecurityUserDetails;
import com.skybooker.security.jwt.JwtTokenProvider;
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

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtTokenProvider jwtTokenProvider;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private UserMapper userMapper;

    @InjectMocks
    private AuthService authService;

    private User user;
    private UserResponse userResponse;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(UUID.randomUUID())
                .email("alice@skybooker.io")
                .password("hashed-password")
                .firstName("Alice")
                .lastName("Doe")
                .role(UserRole.USER)
                .enabled(true)
                .build();

        userResponse = new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getPhone(),
                user.getRole(),
                null
        );
    }

    @Test
    void register_createsUserAndReturnsTokens() {
        RegisterRequest request = new RegisterRequest(
                "alice@skybooker.io", "Secret1234!", "Alice", "Doe", "+33100000000"
        );

        when(userRepository.existsByEmail(request.email())).thenReturn(false);
        when(passwordEncoder.encode(request.password())).thenReturn("hashed-password");
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(jwtTokenProvider.generateAccessToken(any(SecurityUserDetails.class))).thenReturn("access-token");
        when(jwtTokenProvider.generateRefreshToken(any(SecurityUserDetails.class))).thenReturn("refresh-token");
        when(userMapper.toResponse(any(User.class))).thenReturn(userResponse);

        AuthResponse response = authService.register(request);

        assertThat(response.accessToken()).isEqualTo("access-token");
        assertThat(response.refreshToken()).isEqualTo("refresh-token");
        assertThat(response.user().email()).isEqualTo("alice@skybooker.io");
        verify(userRepository).existsByEmail("alice@skybooker.io");
    }

    @Test
    void register_failsWhenEmailAlreadyExists() {
        RegisterRequest request = new RegisterRequest(
                "alice@skybooker.io", "Secret1234!", "Alice", "Doe", null
        );

        when(userRepository.existsByEmail(request.email())).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("already registered");

        verify(userRepository, never()).save(any());
        verify(passwordEncoder, never()).encode(anyString());
    }

    @Test
    void login_returnsNewTokens() {
        LoginRequest request = new LoginRequest("alice@skybooker.io", "Secret1234!");
        SecurityUserDetails userDetails = new SecurityUserDetails(user);
        Authentication auth = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

        when(authenticationManager.authenticate(any())).thenReturn(auth);
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(jwtTokenProvider.generateAccessToken(any(SecurityUserDetails.class))).thenReturn("new-access");
        when(jwtTokenProvider.generateRefreshToken(any(SecurityUserDetails.class))).thenReturn("new-refresh");
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(userMapper.toResponse(any(User.class))).thenReturn(userResponse);

        AuthResponse response = authService.login(request);

        assertThat(response.accessToken()).isEqualTo("new-access");
        assertThat(response.refreshToken()).isEqualTo("new-refresh");
    }

    @Test
    void refreshToken_rejectsInvalidToken() {
        when(jwtTokenProvider.validateToken("bad-token")).thenReturn(false);

        assertThatThrownBy(() -> authService.refreshToken("bad-token"))
                .isInstanceOf(UnauthorizedException.class);
    }

    @Test
    void refreshToken_rejectsMismatchedToken() {
        user.setRefreshToken("stored-refresh");

        when(jwtTokenProvider.validateToken("incoming-refresh")).thenReturn(true);
        when(jwtTokenProvider.getUsernameFromToken("incoming-refresh")).thenReturn(user.getEmail());
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authService.refreshToken("incoming-refresh"))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("mismatch");
    }
}
