package com.skybooker.service;

import com.skybooker.entity.BoardingPass;
import com.skybooker.entity.Booking;
import com.skybooker.entity.Payment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    private static final String FROM_EMAIL = "noreply@skybooker.com";

    @Async
    public void sendBookingConfirmation(Booking booking) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(FROM_EMAIL);
            message.setTo(booking.getUser().getEmail());
            message.setSubject("Booking Confirmation - " + booking.getBookingReference());
            message.setText(String.format("""
                    Dear %s %s,

                    Your booking has been confirmed!

                    Booking Reference: %s
                    Flight: %s
                    From: %s (%s) -> To: %s (%s)
                    Departure: %s
                    Total Price: %s %s

                    Thank you for choosing SkyBooker!

                    Best regards,
                    The SkyBooker Team
                    """,
                    booking.getUser().getFirstName(),
                    booking.getUser().getLastName(),
                    booking.getBookingReference(),
                    booking.getFlight().getFlightNumber(),
                    booking.getFlight().getOriginCity(),
                    booking.getFlight().getOriginCode(),
                    booking.getFlight().getDestinationCity(),
                    booking.getFlight().getDestinationCode(),
                    booking.getFlight().getDepartureTime(),
                    booking.getCurrency(),
                    booking.getTotalPrice()
            ));

            mailSender.send(message);
            log.info("Booking confirmation email sent to: {}", booking.getUser().getEmail());
        } catch (Exception e) {
            log.error("Failed to send booking confirmation email to: {}", booking.getUser().getEmail(), e);
        }
    }

    @Async
    public void sendPaymentConfirmation(Payment payment) {
        try {
            Booking booking = payment.getBooking();
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(FROM_EMAIL);
            message.setTo(booking.getUser().getEmail());
            message.setSubject("Payment Confirmation - " + booking.getBookingReference());
            message.setText(String.format("""
                    Dear %s %s,

                    Your payment has been successfully processed!

                    Booking Reference: %s
                    Amount: %s %s
                    Payment Status: %s

                    You can now proceed to check in for your flight.

                    Best regards,
                    The SkyBooker Team
                    """,
                    booking.getUser().getFirstName(),
                    booking.getUser().getLastName(),
                    booking.getBookingReference(),
                    payment.getCurrency(),
                    payment.getAmount(),
                    payment.getStatus()
            ));

            mailSender.send(message);
            log.info("Payment confirmation email sent to: {}", booking.getUser().getEmail());
        } catch (Exception e) {
            log.error("Failed to send payment confirmation email", e);
        }
    }

    @Async
    public void sendBoardingPass(BoardingPass boardingPass) {
        try {
            Booking booking = boardingPass.getBooking();
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(FROM_EMAIL);
            message.setTo(booking.getUser().getEmail());
            message.setSubject("Boarding Pass - " + booking.getBookingReference());
            message.setText(String.format("""
                    Dear %s %s,

                    Your boarding pass is ready!

                    Booking Reference: %s
                    Flight: %s
                    Passenger: %s %s
                    Gate: %s
                    Boarding Group: %s

                    Please arrive at the gate at least 30 minutes before departure.

                    Best regards,
                    The SkyBooker Team
                    """,
                    booking.getUser().getFirstName(),
                    booking.getUser().getLastName(),
                    booking.getBookingReference(),
                    booking.getFlight().getFlightNumber(),
                    boardingPass.getPassenger().getFirstName(),
                    boardingPass.getPassenger().getLastName(),
                    boardingPass.getGate(),
                    boardingPass.getBoardingGroup()
            ));

            mailSender.send(message);
            log.info("Boarding pass email sent to: {}", booking.getUser().getEmail());
        } catch (Exception e) {
            log.error("Failed to send boarding pass email", e);
        }
    }
}
