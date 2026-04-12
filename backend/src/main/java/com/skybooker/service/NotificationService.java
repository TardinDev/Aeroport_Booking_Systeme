package com.skybooker.service;

import com.skybooker.enums.FlightStatus;
import com.skybooker.enums.PaymentStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * Pushes real-time notifications to connected clients through STOMP over WebSocket.
 *
 * Topics:
 * - /topic/flights/{flightId} : broadcast flight status changes to all subscribers
 * - /user/queue/bookings : user-specific booking updates
 * - /user/queue/payments : user-specific payment updates
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public void broadcastFlightStatus(UUID flightId, FlightStatus status, String message) {
        String destination = "/topic/flights/" + flightId;
        Map<String, Object> payload = Map.of(
                "flightId", flightId.toString(),
                "status", status.name(),
                "message", message == null ? "" : message,
                "timestamp", Instant.now().toString()
        );
        log.debug("Broadcasting flight status to {} -> {}", destination, payload);
        messagingTemplate.convertAndSend(destination, payload);
    }

    public void notifyBookingUpdate(String userEmail, UUID bookingId, String status, String message) {
        Map<String, Object> payload = Map.of(
                "bookingId", bookingId.toString(),
                "status", status,
                "message", message == null ? "" : message,
                "timestamp", Instant.now().toString()
        );
        log.debug("Sending booking update to user {} -> {}", userEmail, payload);
        messagingTemplate.convertAndSendToUser(userEmail, "/queue/bookings", payload);
    }

    public void notifyPaymentUpdate(String userEmail, UUID bookingId, PaymentStatus status, String message) {
        Map<String, Object> payload = Map.of(
                "bookingId", bookingId.toString(),
                "status", status.name(),
                "message", message == null ? "" : message,
                "timestamp", Instant.now().toString()
        );
        log.debug("Sending payment update to user {} -> {}", userEmail, payload);
        messagingTemplate.convertAndSendToUser(userEmail, "/queue/payments", payload);
    }
}
