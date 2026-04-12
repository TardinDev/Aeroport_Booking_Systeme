package com.skybooker.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * IP-based rate limiting filter using Bucket4j (in-memory token buckets).
 *
 * - Auth endpoints (/api/v1/auth/**): 10 requests / minute per IP (brute-force mitigation)
 * - Payment endpoints (/api/v1/payments/**): 20 requests / minute per IP
 * - Other endpoints: 100 requests / minute per IP
 */
@Slf4j
@Component
@Order(1)
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final int AUTH_LIMIT = 10;
    private static final int PAYMENT_LIMIT = 20;
    private static final int DEFAULT_LIMIT = 100;

    private final Map<String, Bucket> authBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> paymentBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> defaultBuckets = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();

        // Skip rate limiting for Swagger, actuator, and webhooks
        if (path.startsWith("/swagger") || path.startsWith("/api-docs")
                || path.startsWith("/v3/api-docs") || path.startsWith("/actuator")
                || path.equals("/api/v1/payments/webhook")) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = resolveClientIp(request);
        Bucket bucket = resolveBucket(path, clientIp);

        if (bucket.tryConsume(1)) {
            long remaining = bucket.getAvailableTokens();
            response.setHeader("X-RateLimit-Remaining", String.valueOf(remaining));
            filterChain.doFilter(request, response);
        } else {
            log.warn("Rate limit exceeded for IP {} on path {}", clientIp, path);
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write("""
                    {
                      "status": 429,
                      "error": "Too Many Requests",
                      "message": "Rate limit exceeded. Please try again later."
                    }
                    """);
        }
    }

    private Bucket resolveBucket(String path, String clientIp) {
        if (path.startsWith("/api/v1/auth")) {
            return authBuckets.computeIfAbsent(clientIp, k -> newBucket(AUTH_LIMIT));
        }
        if (path.startsWith("/api/v1/payments")) {
            return paymentBuckets.computeIfAbsent(clientIp, k -> newBucket(PAYMENT_LIMIT));
        }
        return defaultBuckets.computeIfAbsent(clientIp, k -> newBucket(DEFAULT_LIMIT));
    }

    private Bucket newBucket(int capacityPerMinute) {
        return Bucket.builder()
                .addLimit(Bandwidth.builder()
                        .capacity(capacityPerMinute)
                        .refillGreedy(capacityPerMinute, Duration.ofMinutes(1))
                        .build())
                .build();
    }

    private String resolveClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }
        return request.getRemoteAddr();
    }
}
