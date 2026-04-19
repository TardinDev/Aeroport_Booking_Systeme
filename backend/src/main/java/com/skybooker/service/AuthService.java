package com.skybooker.service;

import com.skybooker.dto.request.LoginRequest;
import com.skybooker.dto.request.RegisterRequest;
import com.skybooker.dto.response.AuthResponse;
import com.skybooker.entity.User;
import com.skybooker.enums.Role;
import com.skybooker.exception.ConflictException;
import com.skybooker.exception.ResourceNotFoundException;
import com.skybooker.mapper.UserMapper;
import com.skybooker.repository.UserRepository;
import com.skybooker.security.JwtTokenProvider;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserMapper userMapper;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider,
                       UserMapper userMapper) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.userMapper = userMapper;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new ConflictException("Email already registered");
        }
        User user = User.builder()
                .email(request.email().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.password()))
                .firstName(request.firstName())
                .lastName(request.lastName())
                .role(Role.USER)
                .enabled(true)
                .build();
        user = userRepository.save(user);
        log.info("Registered new user id={} email={}", user.getId(), user.getEmail());
        return issueTokens(user);
    }

    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        } catch (BadCredentialsException ex) {
            throw new BadCredentialsException("Invalid email or password");
        }
        User user = userRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> ResourceNotFoundException.of("User", request.email()));
        return issueTokens(user);
    }

    public AuthResponse refresh(String refreshToken) {
        Claims claims;
        try {
            claims = tokenProvider.parseAndValidate(refreshToken);
        } catch (JwtException | IllegalArgumentException ex) {
            throw new BadCredentialsException("Invalid refresh token");
        }
        if (!tokenProvider.isRefreshToken(claims)) {
            throw new BadCredentialsException("Not a refresh token");
        }
        Long userId = tokenProvider.userId(claims);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.of("User", userId));
        return issueTokens(user);
    }

    private AuthResponse issueTokens(User user) {
        String access = tokenProvider.generateAccessToken(user);
        String refresh = tokenProvider.generateRefreshToken(user);
        return new AuthResponse(access, refresh, userMapper.toResponse(user));
    }
}
