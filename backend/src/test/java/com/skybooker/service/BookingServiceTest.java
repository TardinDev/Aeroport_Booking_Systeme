package com.skybooker.service;

import com.skybooker.dto.request.CreateBookingRequest;
import com.skybooker.dto.request.PassengerRequest;
import com.skybooker.dto.response.BookingResponse;
import com.skybooker.entity.Booking;
import com.skybooker.entity.Flight;
import com.skybooker.entity.Seat;
import com.skybooker.entity.User;
import com.skybooker.enums.BookingStatus;
import com.skybooker.enums.Role;
import com.skybooker.enums.SeatClass;
import com.skybooker.enums.SeatStatus;
import com.skybooker.exception.ConflictException;
import com.skybooker.mapper.BookingMapper;
import com.skybooker.repository.BookingRepository;
import com.skybooker.repository.FlightRepository;
import com.skybooker.repository.SeatRepository;
import com.skybooker.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock BookingRepository bookingRepository;
    @Mock FlightRepository flightRepository;
    @Mock SeatRepository seatRepository;
    @Mock UserRepository userRepository;
    @Mock BookingMapper bookingMapper;

    @InjectMocks BookingService bookingService;

    private User user;
    private Flight flight;
    private Seat seatEconomy;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).email("a@b.com").passwordHash("h").firstName("A").lastName("B").role(Role.USER).enabled(true).createdAt(Instant.now()).build();
        flight = Flight.builder()
                .id(10L)
                .flightNumber("AF1234")
                .availableSeats(30)
                .totalSeats(60)
                .basePrice(new BigDecimal("100.00"))
                .build();
        seatEconomy = Seat.builder()
                .id(500L)
                .flight(flight)
                .rowNumber(8)
                .seatColumn("B")
                .seatClass(SeatClass.ECONOMY)
                .priceMultiplier(new BigDecimal("1.00"))
                .status(SeatStatus.AVAILABLE)
                .build();
    }

    @Test
    void createBooking_succeedsAndDecrementsAvailableSeats() {
        CreateBookingRequest request = new CreateBookingRequest(
                10L,
                List.of(new PassengerRequest("Alice", "Martin", LocalDate.of(1990, 1, 1), "FRX123")),
                List.of(500L));

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(flightRepository.findById(10L)).thenReturn(Optional.of(flight));
        when(seatRepository.lockByIds(List.of(500L))).thenReturn(List.of(seatEconomy));
        when(bookingRepository.existsByBookingReference(anyString())).thenReturn(false);
        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));
        when(bookingMapper.toResponse(any(Booking.class))).thenReturn(
                new BookingResponse(null, "SKY-ABCDEF", null, List.of(), BookingStatus.CONFIRMED, new BigDecimal("100.00"), Instant.now()));

        BookingResponse response = bookingService.createBooking(request, 1L);

        assertThat(response.status()).isEqualTo(BookingStatus.CONFIRMED);
        assertThat(flight.getAvailableSeats()).isEqualTo(29);
        assertThat(seatEconomy.getStatus()).isEqualTo(SeatStatus.RESERVED);

        ArgumentCaptor<Booking> captor = ArgumentCaptor.forClass(Booking.class);
        verify(bookingRepository).save(captor.capture());
        Booking saved = captor.getValue();
        assertThat(saved.getBookingReference()).startsWith("SKY-");
        assertThat(saved.getTotalPrice()).isEqualByComparingTo("100.00");
        assertThat(saved.getPassengers()).hasSize(1);
    }

    @Test
    void createBooking_throwsWhenSeatAlreadyReserved() {
        seatEconomy.setStatus(SeatStatus.RESERVED);
        CreateBookingRequest request = new CreateBookingRequest(
                10L,
                List.of(new PassengerRequest("Alice", "Martin", LocalDate.of(1990, 1, 1), "FRX123")),
                List.of(500L));

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(flightRepository.findById(10L)).thenReturn(Optional.of(flight));
        when(seatRepository.lockByIds(List.of(500L))).thenReturn(List.of(seatEconomy));

        assertThatThrownBy(() -> bookingService.createBooking(request, 1L))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("already taken");

        verify(bookingRepository, never()).save(any());
    }

    @Test
    void cancelBooking_releasesSeatsAndIncrementsAvailability() {
        seatEconomy.setStatus(SeatStatus.RESERVED);
        int originalAvailable = flight.getAvailableSeats();

        Booking booking = Booking.builder()
                .id(77L)
                .bookingReference("SKY-ABCDEF")
                .user(user)
                .flight(flight)
                .status(BookingStatus.CONFIRMED)
                .totalPrice(new BigDecimal("100.00"))
                .createdAt(Instant.now())
                .build();
        com.skybooker.entity.Passenger passenger = com.skybooker.entity.Passenger.builder()
                .id(9L)
                .firstName("Alice").lastName("Martin")
                .dateOfBirth(LocalDate.of(1990, 1, 1))
                .passportNumber("FRX123")
                .seat(seatEconomy)
                .build();
        booking.addPassenger(passenger);

        when(bookingRepository.findByIdWithFlight(77L)).thenReturn(Optional.of(booking));
        when(bookingMapper.toResponse(booking)).thenReturn(
                new BookingResponse(77L, "SKY-ABCDEF", null, List.of(), BookingStatus.CANCELLED, new BigDecimal("100.00"), Instant.now()));

        BookingResponse result = bookingService.cancelBooking(77L, 1L, Role.USER);

        assertThat(result.status()).isEqualTo(BookingStatus.CANCELLED);
        assertThat(booking.getStatus()).isEqualTo(BookingStatus.CANCELLED);
        assertThat(seatEconomy.getStatus()).isEqualTo(SeatStatus.AVAILABLE);
        assertThat(flight.getAvailableSeats()).isEqualTo(originalAvailable + 1);
    }
}
