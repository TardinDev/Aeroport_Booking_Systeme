package com.skybooker.controller;

import com.skybooker.dto.request.PaymentRequest;
import com.skybooker.dto.response.PaymentIntentResponse;
import com.skybooker.entity.Payment;
import com.skybooker.security.SecurityUserDetails;
import com.skybooker.service.AuthService;
import com.skybooker.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Payment processing with Stripe")
public class PaymentController {

    private final PaymentService paymentService;
    private final AuthService authService;

    @PostMapping("/create-intent")
    @Operation(summary = "Create a Stripe PaymentIntent for a booking")
    public ResponseEntity<PaymentIntentResponse> createPaymentIntent(@Valid @RequestBody PaymentRequest request) {
        PaymentIntentResponse response = paymentService.createPaymentIntent(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/webhook")
    @Operation(summary = "Handle Stripe webhook events")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader
    ) {
        paymentService.handleWebhook(payload, sigHeader);
        return ResponseEntity.ok("Webhook processed");
    }

    @GetMapping("/history")
    @Operation(summary = "Get payment history for the current user")
    public ResponseEntity<List<Payment>> getPaymentHistory() {
        SecurityUserDetails user = authService.getAuthenticatedUser();
        List<Payment> payments = paymentService.getPaymentHistory(user.getId());
        return ResponseEntity.ok(payments);
    }
}
