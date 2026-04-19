package com.skybooker.service;

import com.skybooker.dto.request.CreateBookingRequest;
import com.skybooker.dto.request.PassengerRequest;
import com.skybooker.dto.response.BookingResponse;
import com.skybooker.entity.Booking;
import com.skybooker.entity.Flight;
import com.skybooker.entity.Passenger;
import com.skybooker.entity.Seat;
import com.skybooker.entity.User;
import com.skybooker.enums.BookingStatus;
import com.skybooker.enums.Role;
import com.skybooker.enums.SeatStatus;
import com.skybooker.exception.BadRequestException;
import com.skybooker.exception.ConflictException;
import com.skybooker.exception.ForbiddenException;
import com.skybooker.exception.ResourceNotFoundException;
import com.skybooker.mapper.BookingMapper;
import com.skybooker.repository.BookingRepository;
import com.skybooker.repository.FlightRepository;
import com.skybooker.repository.SeatRepository;
import com.skybooker.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
public class BookingService {

    private static final String REFERENCE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final BookingRepository bookingRepository;
    private final FlightRepository flightRepository;
    private final SeatRepository seatRepository;
    private final UserRepository userRepository;
    private final BookingMapper bookingMapper;

    public BookingService(BookingRepository bookingRepository,
                          FlightRepository flightRepository,
                          SeatRepository seatRepository,
                          UserRepository userRepository,
                          BookingMapper bookingMapper) {
        this.bookingRepository = bookingRepository;
        this.flightRepository = flightRepository;
        this.seatRepository = seatRepository;
        this.userRepository = userRepository;
        this.bookingMapper = bookingMapper;
    }

    @Transactional
    public BookingResponse createBooking(CreateBookingRequest request, Long userId) {
        if (request.passengers().size() != request.seatIds().size()) {
            throw new BadRequestException("Passengers count must match seat IDs count");
        }
        if (new HashSet<>(request.seatIds()).size() != request.seatIds().size()) {
            throw new BadRequestException("Duplicate seat IDs in request");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.of("User", userId));

        Flight flight = flightRepository.findById(request.flightId())
                .orElseThrow(() -> ResourceNotFoundException.of("Flight", request.flightId()));

        int requested = request.seatIds().size();
        if (flight.getAvailableSeats() < requested) {
            throw new ConflictException("Flight has only " + flight.getAvailableSeats() + " available seats");
        }

        List<Seat> seats = seatRepository.lockByIds(request.seatIds());
        if (seats.size() != request.seatIds().size()) {
            throw new ResourceNotFoundException("One or more seats not found");
        }

        BigDecimal totalPrice = BigDecimal.ZERO;
        BigDecimal basePrice = flight.getBasePrice();
        Set<Long> seenSeatIds = new HashSet<>();
        for (Seat seat : seats) {
            if (!seat.getFlight().getId().equals(flight.getId())) {
                throw new BadRequestException("Seat " + seat.getId() + " does not belong to flight " + flight.getId());
            }
            if (seat.getStatus() != SeatStatus.AVAILABLE) {
                throw new ConflictException("Seat " + seat.label() + " is already taken");
            }
            if (!seenSeatIds.add(seat.getId())) {
                throw new BadRequestException("Duplicate seat: " + seat.label());
            }
            totalPrice = totalPrice.add(basePrice.multiply(seat.getPriceMultiplier()));
        }

        Booking booking = Booking.builder()
                .bookingReference(generateUniqueReference())
                .user(user)
                .flight(flight)
                .status(BookingStatus.CONFIRMED)
                .totalPrice(totalPrice)
                .build();

        List<Seat> seatsInRequestedOrder = new ArrayList<>();
        for (Long seatId : request.seatIds()) {
            seatsInRequestedOrder.add(seats.stream()
                    .filter(s -> s.getId().equals(seatId))
                    .findFirst()
                    .orElseThrow());
        }
        for (int i = 0; i < request.passengers().size(); i++) {
            PassengerRequest pr = request.passengers().get(i);
            Seat seat = seatsInRequestedOrder.get(i);
            seat.setStatus(SeatStatus.RESERVED);
            Passenger passenger = Passenger.builder()
                    .firstName(pr.firstName())
                    .lastName(pr.lastName())
                    .dateOfBirth(pr.dateOfBirth())
                    .passportNumber(pr.passportNumber())
                    .seat(seat)
                    .build();
            booking.addPassenger(passenger);
        }

        flight.setAvailableSeats(flight.getAvailableSeats() - requested);
        Booking saved = bookingRepository.save(booking);
        log.info("Booking created ref={} user={} flight={} total={}",
                saved.getBookingReference(), userId, flight.getId(), totalPrice);

        return bookingMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long id, Long userId, Role role) {
        Booking booking = bookingRepository.findByIdWithFlight(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Booking", id));
        authorize(booking, userId, role);
        return bookingMapper.toResponse(booking);
    }

    @Transactional(readOnly = true)
    public Booking getBookingEntity(Long id, Long userId, Role role) {
        Booking booking = bookingRepository.findByIdWithFlight(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Booking", id));
        authorize(booking, userId, role);
        // Force-load passengers + seats for downstream use (e.g. PDF generation)
        booking.getPassengers().forEach(p -> {
            if (p.getSeat() != null) {
                p.getSeat().getSeatClass();
            }
        });
        return booking;
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings(Long userId) {
        return bookingRepository.findAllByUserId(userId).stream()
                .map(bookingMapper::toResponse)
                .toList();
    }

    @Transactional
    public BookingResponse cancelBooking(Long id, Long userId, Role role) {
        Booking booking = bookingRepository.findByIdWithFlight(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Booking", id));
        authorize(booking, userId, role);

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            return bookingMapper.toResponse(booking);
        }

        int releasedSeats = 0;
        for (Passenger passenger : booking.getPassengers()) {
            Seat seat = passenger.getSeat();
            if (seat != null && seat.getStatus() != SeatStatus.AVAILABLE) {
                seat.setStatus(SeatStatus.AVAILABLE);
                releasedSeats++;
            }
        }
        Flight flight = booking.getFlight();
        flight.setAvailableSeats(flight.getAvailableSeats() + releasedSeats);

        booking.setStatus(BookingStatus.CANCELLED);
        log.info("Booking cancelled ref={} user={} released={} seats",
                booking.getBookingReference(), userId, releasedSeats);
        return bookingMapper.toResponse(booking);
    }

    private void authorize(Booking booking, Long userId, Role role) {
        if (role == Role.ADMIN || role == Role.AGENT) {
            return;
        }
        if (!booking.getUser().getId().equals(userId)) {
            throw new ForbiddenException("You do not own this booking");
        }
    }

    private String generateUniqueReference() {
        for (int attempt = 0; attempt < 10; attempt++) {
            String reference = "SKY-" + randomCode(6);
            if (!bookingRepository.existsByBookingReference(reference)) {
                return reference;
            }
        }
        throw new IllegalStateException("Unable to generate a unique booking reference");
    }

    private String randomCode(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(REFERENCE_ALPHABET.charAt(RANDOM.nextInt(REFERENCE_ALPHABET.length())));
        }
        return sb.toString();
    }
}
