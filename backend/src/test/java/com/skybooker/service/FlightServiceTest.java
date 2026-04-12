package com.skybooker.service;

import com.skybooker.dto.request.FlightSearchRequest;
import com.skybooker.dto.response.FlightResponse;
import com.skybooker.dto.response.FlightSearchResponse;
import com.skybooker.dto.response.SeatMapResponse;
import com.skybooker.dto.response.SeatResponse;
import com.skybooker.entity.Airline;
import com.skybooker.entity.Flight;
import com.skybooker.entity.Seat;
import com.skybooker.enums.FlightStatus;
import com.skybooker.enums.SeatClass;
import com.skybooker.enums.SeatStatus;
import com.skybooker.exception.ResourceNotFoundException;
import com.skybooker.mapper.FlightMapper;
import com.skybooker.mapper.SeatMapper;
import com.skybooker.repository.FlightRepository;
import com.skybooker.repository.SeatRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FlightServiceTest {

    @Mock private FlightRepository flightRepository;
    @Mock private SeatRepository seatRepository;
    @Mock private FlightMapper flightMapper;
    @Mock private SeatMapper seatMapper;

    @InjectMocks
    private FlightService flightService;

    private Flight flight;
    private FlightResponse flightResponse;

    @BeforeEach
    void setUp() {
        Airline airline = Airline.builder()
                .id(UUID.randomUUID())
                .code("AF")
                .name("Air France")
                .build();

        flight = Flight.builder()
                .id(UUID.randomUUID())
                .flightNumber("AF123")
                .originCode("CDG")
                .destinationCode("JFK")
                .departureTime(LocalDateTime.now().plusDays(2))
                .arrivalTime(LocalDateTime.now().plusDays(2).plusHours(8))
                .availableSeats(150)
                .totalSeats(180)
                .status(FlightStatus.SCHEDULED)
                .seatClass(SeatClass.ECONOMY)
                .basePrice(BigDecimal.valueOf(450))
                .airline(airline)
                .build();

        flightResponse = new FlightResponse(
                flight.getId(),
                flight.getFlightNumber(),
                "Air France",
                "AF",
                null,
                flight.getOriginCode(),
                "Paris CDG",
                "Paris",
                "France",
                flight.getDestinationCode(),
                "JFK",
                "New York",
                "USA",
                flight.getDepartureTime(),
                flight.getArrivalTime(),
                480,
                flight.getBasePrice(),
                "EUR",
                flight.getSeatClass(),
                flight.getTotalSeats(),
                flight.getAvailableSeats(),
                flight.getStatus(),
                0,
                "https://www.skyscanner.net/transport/flights/cdg/jfk/250510/",
                "Air France",
                "AIRLINE",
                null
        );
    }

    @Test
    void searchFlights_returnsMappedPage() {
        FlightSearchRequest request = new FlightSearchRequest(
                "CDG", "JFK", LocalDate.now().plusDays(2), null, 2, SeatClass.ECONOMY, "one-way"
        );

        Page<Flight> page = new PageImpl<>(List.of(flight));
        when(flightRepository.searchFlights(
                any(), any(), any(), any(), any(), eq(2), eq(FlightStatus.SCHEDULED), any(Pageable.class)
        )).thenReturn(page);
        when(flightMapper.toResponse(flight)).thenReturn(flightResponse);

        FlightSearchResponse response = flightService.searchFlights(request, 0, 10);

        assertThat(response.flights()).hasSize(1);
        assertThat(response.flights().get(0).flightNumber()).isEqualTo("AF123");
        assertThat(response.totalResults()).isEqualTo(1);
    }

    @Test
    void getFlightById_throwsWhenNotFound() {
        UUID id = UUID.randomUUID();
        when(flightRepository.findByIdWithAirline(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> flightService.getFlightById(id))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void getFlightSeats_returnsAvailabilityCount() {
        UUID flightId = flight.getId();
        when(flightRepository.findByIdWithAirline(flightId)).thenReturn(Optional.of(flight));

        Seat available = Seat.builder().id(UUID.randomUUID())
                .row(10).seatColumn("A").status(SeatStatus.AVAILABLE).build();
        Seat booked = Seat.builder().id(UUID.randomUUID())
                .row(10).seatColumn("B").status(SeatStatus.OCCUPIED).build();

        when(seatRepository.findByFlightId(flightId)).thenReturn(List.of(available, booked));
        when(seatMapper.toResponseList(any())).thenReturn(List.of(
                new SeatResponse(available.getId(), 10, "A", SeatClass.ECONOMY,
                        SeatStatus.AVAILABLE, BigDecimal.ZERO, false, false, false),
                new SeatResponse(booked.getId(), 10, "B", SeatClass.ECONOMY,
                        SeatStatus.OCCUPIED, BigDecimal.ZERO, false, false, false)
        ));

        SeatMapResponse response = flightService.getFlightSeats(flightId);

        assertThat(response.totalSeats()).isEqualTo(2);
        assertThat(response.availableSeats()).isEqualTo(1);
        assertThat(response.seats()).hasSize(2);
    }
}
