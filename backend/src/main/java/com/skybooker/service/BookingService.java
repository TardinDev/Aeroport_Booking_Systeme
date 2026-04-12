package com.skybooker.service;

import com.skybooker.dto.request.BookingRequest;
import com.skybooker.dto.response.BookingResponse;
import com.skybooker.entity.*;
import com.skybooker.enums.BookingStatus;
import com.skybooker.enums.PaymentStatus;
import com.skybooker.enums.SeatStatus;
import com.skybooker.exception.BadRequestException;
import com.skybooker.exception.ResourceNotFoundException;
import com.skybooker.exception.SeatAlreadyBookedException;
import com.skybooker.mapper.BookingMapper;
import com.skybooker.mapper.FlightMapper;
import com.skybooker.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final BookingRepository bookingRepository;
    private final FlightRepository flightRepository;
    private final UserRepository userRepository;
    private final SeatRepository seatRepository;
    private final PassengerRepository passengerRepository;
    private final PaymentRepository paymentRepository;
    private final BookingMapper bookingMapper;
    private final FlightMapper flightMapper;

    private static final String ALPHANUMERIC = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    @Transactional
    public BookingResponse createBooking(BookingRequest request, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Flight flight = flightRepository.findByIdWithAirline(request.flightId())
                .orElseThrow(() -> new ResourceNotFoundException("Flight", "id", request.flightId()));

        if (flight.getAvailableSeats() < request.passengers().size()) {
            throw new BadRequestException("Not enough available seats on this flight");
        }

        // Validate and lock seats if selected
        List<Seat> selectedSeats = new ArrayList<>();
        if (request.selectedSeatIds() != null && !request.selectedSeatIds().isEmpty()) {
            for (UUID seatId : request.selectedSeatIds()) {
                Seat seat = seatRepository.findById(seatId)
                        .orElseThrow(() -> new ResourceNotFoundException("Seat", "id", seatId));
                if (seat.getStatus() != SeatStatus.AVAILABLE) {
                    throw new SeatAlreadyBookedException("Seat " + seat.getRow() + seat.getSeatColumn() + " is not available");
                }
                seat.setStatus(SeatStatus.OCCUPIED);
                selectedSeats.add(seat);
            }
            seatRepository.saveAll(selectedSeats);
        }

        // Calculate total price
        BigDecimal totalPrice = flight.getBasePrice()
                .multiply(BigDecimal.valueOf(request.passengers().size()));

        // Add seat surcharges
        for (Seat seat : selectedSeats) {
            if (seat.getPrice() != null) {
                totalPrice = totalPrice.add(seat.getPrice());
            }
        }

        // Create booking
        Booking booking = Booking.builder()
                .bookingReference(generateBookingReference())
                .user(user)
                .flight(flight)
                .status(BookingStatus.PENDING)
                .totalPrice(totalPrice)
                .currency(flight.getCurrency())
                .build();

        booking = bookingRepository.save(booking);

        // Create passengers
        List<Passenger> passengers = new ArrayList<>();
        for (int i = 0; i < request.passengers().size(); i++) {
            BookingRequest.PassengerInfo info = request.passengers().get(i);
            Passenger passenger = Passenger.builder()
                    .booking(booking)
                    .firstName(info.firstName())
                    .lastName(info.lastName())
                    .email(info.email())
                    .phone(info.phone())
                    .passportNumber(info.passportNumber())
                    .dateOfBirth(info.dateOfBirth() != null ?
                            LocalDate.parse(info.dateOfBirth(), DateTimeFormatter.ISO_LOCAL_DATE) : null)
                    .seat(i < selectedSeats.size() ? selectedSeats.get(i) : null)
                    .build();
            passengers.add(passenger);
        }
        passengerRepository.saveAll(passengers);
        booking.setPassengers(passengers);

        // Update available seats count
        flight.setAvailableSeats(flight.getAvailableSeats() - request.passengers().size());
        flightRepository.save(flight);

        log.info("Booking created: {} for user: {}", booking.getBookingReference(), user.getEmail());

        return toBookingResponse(booking);
    }

    @Transactional(readOnly = true)
    public BookingResponse getBookingById(UUID bookingId) {
        Booking booking = bookingRepository.findByIdWithDetails(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));
        return toBookingResponse(booking);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getUserBookings(UUID userId) {
        List<Booking> bookings = bookingRepository.findByUserId(userId);
        return bookings.stream().map(this::toBookingResponse).toList();
    }

    @Transactional
    public BookingResponse cancelBooking(UUID bookingId) {
        Booking booking = bookingRepository.findByIdWithDetails(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Booking is already cancelled");
        }

        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new BadRequestException("Cannot cancel a completed booking");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);

        // Release seats
        List<Passenger> passengers = passengerRepository.findByBookingId(bookingId);
        for (Passenger passenger : passengers) {
            if (passenger.getSeat() != null) {
                Seat seat = passenger.getSeat();
                seat.setStatus(SeatStatus.AVAILABLE);
                seatRepository.save(seat);
            }
        }

        // Restore available seats count
        Flight flight = booking.getFlight();
        flight.setAvailableSeats(flight.getAvailableSeats() + passengers.size());
        flightRepository.save(flight);

        log.info("Booking cancelled: {}", booking.getBookingReference());
        return toBookingResponse(booking);
    }

    private BookingResponse toBookingResponse(Booking booking) {
        List<Passenger> passengers = passengerRepository.findByBookingId(booking.getId());

        List<BookingResponse.PassengerResponse> passengerResponses = passengers.stream()
                .map(p -> new BookingResponse.PassengerResponse(
                        p.getId(),
                        p.getFirstName(),
                        p.getLastName(),
                        p.getEmail(),
                        p.getPhone(),
                        p.getPassportNumber(),
                        null
                ))
                .toList();

        String paymentStatus = paymentRepository.findByBookingId(booking.getId())
                .map(payment -> payment.getStatus().name())
                .orElse(PaymentStatus.PENDING.name());

        return new BookingResponse(
                booking.getId(),
                booking.getBookingReference(),
                flightMapper.toResponse(booking.getFlight()),
                booking.getStatus(),
                booking.getTotalPrice(),
                booking.getCurrency(),
                passengerResponses,
                paymentStatus,
                booking.getCreatedAt(),
                booking.getUpdatedAt()
        );
    }

    private String generateBookingReference() {
        StringBuilder sb = new StringBuilder(8);
        for (int i = 0; i < 8; i++) {
            sb.append(ALPHANUMERIC.charAt(RANDOM.nextInt(ALPHANUMERIC.length())));
        }
        String reference = sb.toString();

        // Ensure uniqueness
        if (bookingRepository.findByBookingReference(reference).isPresent()) {
            return generateBookingReference();
        }
        return reference;
    }
}
