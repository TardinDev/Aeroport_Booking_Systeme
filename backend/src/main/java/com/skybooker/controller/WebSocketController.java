package com.skybooker.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.time.Instant;
import java.util.Map;

/**
 * STOMP message endpoints.
 *
 * Clients can send messages to /app/ping and subscribe to /topic/pong
 * or to /user/queue/replies for private replies.
 */
@Slf4j
@Controller
@RequiredArgsConstructor
public class WebSocketController {

    @MessageMapping("/ping")
    @SendTo("/topic/pong")
    public Map<String, Object> ping() {
        return Map.of(
                "pong", true,
                "timestamp", Instant.now().toString()
        );
    }

    @MessageMapping("/hello")
    @SendToUser("/queue/replies")
    public Map<String, Object> hello(Principal principal) {
        String name = principal != null ? principal.getName() : "anonymous";
        log.debug("Received hello from {}", name);
        return Map.of(
                "message", "Hello " + name,
                "timestamp", Instant.now().toString()
        );
    }
}
