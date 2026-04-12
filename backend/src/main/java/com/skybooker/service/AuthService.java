package com.skybooker.service;

import com.skybooker.dto.request.LoginRequest;
import com.skybooker.dto.request.RegisterRequest;
import com.skybooker.dto.response.AuthResponse;
import com.skybooker.dto.response.UserResponse;
import com.skybooker.entity.User;
import com.skybooker.enums.UserRole;
import com.skybooker.exception.BadRequestException;
import com.skybooker.exception.ResourceNotFoundException;
import com.skybooker.exception.UnauthorizedException;
import com.skybooker.mapper.UserMapper;
import com.skybooker.repository.UserRepository;
import com.skybooker.security.SecurityUserDetails;
import com.skybooker.security.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final UserMapper userMapper;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BadRequestException("Email is already registered");
        }

        User user = User.builder()
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .firstName(request.firstName())
                .lastName(request.lastName())
                .phone(request.phone())
                .role(UserRole.USER)
                .enabled(true)
                .build();

        user = userRepository.save(user);
        log.info("New user registered: {}", user.getEmail());

        SecurityUserDetails userDetails = new SecurityUserDetails(user);
        String accessToken = jwtTokenProvider.generateAccessToken(userDetails);
        String refreshToken = jwtTokenProvider.generateRefreshToken(userDetails);

        user.setRefreshToken(refreshToken);
        userRepository.save(user);

        return new AuthResponse(accessToken, refreshToken, userMapper.toResponse(user));
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        SecurityUserDetails userDetails = (SecurityUserDetails) authentication.getPrincipal();
        User user = userRepository.findByEmail(userDetails.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userDetails.getEmail()));

        String accessToken = jwtTokenProvider.generateAccessToken(userDetails);
        String refreshToken = jwtTokenProvider.generateRefreshToken(userDetails);

        user.setRefreshToken(refreshToken);
        userRepository.save(user);

        log.info("User logged in: {}", user.getEmail());
        return new AuthResponse(accessToken, refreshToken, userMapper.toResponse(user));
    }

    @Transactional
    public AuthResponse refreshToken(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        String email = jwtTokenProvider.getUsernameFromToken(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        if (!refreshToken.equals(user.getRefreshToken())) {
            throw new UnauthorizedException("Refresh token mismatch");
        }

        SecurityUserDetails userDetails = new SecurityUserDetails(user);
        String newAccessToken = jwtTokenProvider.generateAccessToken(userDetails);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(userDetails);

        user.setRefreshToken(newRefreshToken);
        userRepository.save(user);

        return new AuthResponse(newAccessToken, newRefreshToken, userMapper.toResponse(user));
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        SecurityUserDetails userDetails = (SecurityUserDetails) authentication.getPrincipal();

        User user = userRepository.findByEmail(userDetails.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userDetails.getEmail()));

        return userMapper.toResponse(user);
    }

    public SecurityUserDetails getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (SecurityUserDetails) authentication.getPrincipal();
    }
}
