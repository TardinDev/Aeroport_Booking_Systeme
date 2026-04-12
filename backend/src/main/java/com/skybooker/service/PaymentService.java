package com.skybooker.service;

import com.skybooker.dto.request.PaymentRequest;
import com.skybooker.dto.response.PaymentIntentResponse;
import com.skybooker.entity.Booking;
import com.skybooker.entity.Payment;
import com.skybooker.enums.BookingStatus;
import com.skybooker.enums.PaymentStatus;
import com.skybooker.exception.BadRequestException;
import com.skybooker.exception.PaymentFailedException;
import com.skybooker.exception.ResourceNotFoundException;
import com.skybooker.repository.BookingRepository;
import com.skybooker.repository.PaymentRepository;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final NotificationService notificationService;

    @Value("${app.stripe.webhook-secret}")
    private String webhookSecret;

    @Transactional
    public PaymentIntentResponse createPaymentIntent(PaymentRequest request) {
        Booking booking = bookingRepository.findByIdWithDetails(request.bookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", request.bookingId()));

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Cannot pay for a cancelled booking");
        }

        // Check if payment already exists
        if (paymentRepository.findByBookingId(booking.getId()).isPresent()) {
            Payment existingPayment = paymentRepository.findByBookingId(booking.getId()).get();
            if (existingPayment.getStatus() == PaymentStatus.COMPLETED) {
                throw new BadRequestException("Booking is already paid");
            }
        }

        try {
            // Convert to cents for Stripe
            long amountInCents = booking.getTotalPrice()
                    .multiply(BigDecimal.valueOf(100))
                    .longValue();

            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(amountInCents)
                    .setCurrency(booking.getCurrency().toLowerCase())
                    .putMetadata("booking_id", booking.getId().toString())
                    .putMetadata("booking_reference", booking.getBookingReference())
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .build()
                    )
                    .build();

            PaymentIntent paymentIntent = PaymentIntent.create(params);

            // Save payment record
            String idempotencyKey = UUID.randomUUID().toString();
            Payment payment = Payment.builder()
                    .booking(booking)
                    .stripePaymentIntentId(paymentIntent.getId())
                    .amount(booking.getTotalPrice())
                    .currency(booking.getCurrency())
                    .status(PaymentStatus.PROCESSING)
                    .idempotencyKey(idempotencyKey)
                    .build();

            paymentRepository.save(payment);

            log.info("Payment intent created: {} for booking: {}", paymentIntent.getId(), booking.getBookingReference());

            return new PaymentIntentResponse(
                    paymentIntent.getClientSecret(),
                    paymentIntent.getId(),
                    booking.getTotalPrice(),
                    booking.getCurrency()
            );

        } catch (StripeException e) {
            log.error("Stripe error creating payment intent for booking: {}", booking.getBookingReference(), e);
            throw new PaymentFailedException("Failed to create payment: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void handleWebhook(String payload, String sigHeader) {
        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            log.error("Invalid Stripe webhook signature", e);
            throw new BadRequestException("Invalid webhook signature");
        }

        switch (event.getType()) {
            case "payment_intent.succeeded" -> handlePaymentSuccess(event);
            case "payment_intent.payment_failed" -> handlePaymentFailure(event);
            default -> log.info("Unhandled Stripe event type: {}", event.getType());
        }
    }

    private void handlePaymentSuccess(Event event) {
        PaymentIntent paymentIntent = (PaymentIntent) event.getDataObjectDeserializer()
                .getObject().orElse(null);

        if (paymentIntent == null) {
            log.error("Could not deserialize payment intent from webhook event");
            return;
        }

        paymentRepository.findByStripePaymentIntentId(paymentIntent.getId())
                .ifPresent(payment -> {
                    payment.setStatus(PaymentStatus.COMPLETED);
                    payment.setPaymentMethod(paymentIntent.getPaymentMethod());
                    paymentRepository.save(payment);

                    Booking booking = payment.getBooking();
                    booking.setStatus(BookingStatus.CONFIRMED);
                    bookingRepository.save(booking);

                    log.info("Payment succeeded for booking: {}", booking.getBookingReference());

                    if (booking.getUser() != null && booking.getUser().getEmail() != null) {
                        notificationService.notifyPaymentUpdate(
                                booking.getUser().getEmail(),
                                booking.getId(),
                                PaymentStatus.COMPLETED,
                                "Your payment for booking " + booking.getBookingReference() + " has been confirmed."
                        );
                    }
                });
    }

    private void handlePaymentFailure(Event event) {
        PaymentIntent paymentIntent = (PaymentIntent) event.getDataObjectDeserializer()
                .getObject().orElse(null);

        if (paymentIntent == null) return;

        paymentRepository.findByStripePaymentIntentId(paymentIntent.getId())
                .ifPresent(payment -> {
                    payment.setStatus(PaymentStatus.FAILED);
                    paymentRepository.save(payment);

                    Booking booking = payment.getBooking();
                    log.warn("Payment failed for booking: {}", booking.getBookingReference());

                    if (booking.getUser() != null && booking.getUser().getEmail() != null) {
                        notificationService.notifyPaymentUpdate(
                                booking.getUser().getEmail(),
                                booking.getId(),
                                PaymentStatus.FAILED,
                                "Payment failed for booking " + booking.getBookingReference() + ". Please try again."
                        );
                    }
                });
    }

    @Transactional(readOnly = true)
    public List<Payment> getPaymentHistory(UUID userId) {
        return paymentRepository.findByUserId(userId);
    }
}
