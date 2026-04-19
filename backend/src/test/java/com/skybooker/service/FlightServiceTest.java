package com.skybooker.service;

import com.skybooker.dto.request.FlightSearchRequest;
import com.skybooker.dto.response.AirlineResponse;
import com.skybooker.dto.response.AirportResponse;
import com.skybooker.dto.response.FlightResponse;
import com.skybooker.entity.Airline;
import com.skybooker.entity.Airport;
import com.skybooker.entity.Flight;
import com.skybooker.enums.FlightStatus;
import com.skybooker.exception.ResourceNotFoundException;
import com.skybooker.mapper.FlightMapper;
import com.skybooker.repository.FlightRepository;
import com.skybooker.repository.SeatRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
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
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FlightServiceTest {

    @Mock FlightRepository flightRepository;
    @Mock SeatRepository seatRepository;
    @Mock FlightMapper flightMapper;

    @InjectMocks FlightService flightService;

    @Test
    void search_appliesFiltersAndMapsResults() {
        FlightSearchRequest request = new FlightSearchRequest(
                "cdg", "jfk", LocalDate.of(2026, 5, 15), 2, null);

        Airport cdg = Airport.builder().id(1L).iataCode("CDG").name("Paris CDG").city("Paris").country("France").build();
        Airport jfk = Airport.builder().id(3L).iataCode("JFK").name("JFK").city("NYC").country("US").build();
        Airline af = Airline.builder().id(10L).iataCode("AF").name("Air France").build();
        Flight flight = Flight.builder()
                .id(100L)
                .flightNumber("AF1234")
                .airline(af)
                .origin(cdg)
                .destination(jfk)
                .departureTime(Instant.parse("2026-05-15T10:00:00Z"))
                .arrivalTime(Instant.parse("2026-05-15T18:00:00Z"))
                .totalSeats(60)
                .availableSeats(55)
                .basePrice(new BigDecimal("450.00"))
                .status(FlightStatus.SCHEDULED)
                .build();

        FlightResponse mapped = new FlightResponse(100L, "AF1234",
                new AirlineResponse(10L, "AF", "Air France"),
                new AirportResponse(1L, "CDG", "Paris CDG", "Paris", "France"),
                new AirportResponse(3L, "JFK", "JFK", "NYC", "US"),
                flight.getDepartureTime(), flight.getArrivalTime(),
                new BigDecimal("450.00"), 55, FlightStatus.SCHEDULED);

        when(flightRepository.search(eq("CDG"), eq("JFK"), any(Instant.class), any(Instant.class), anyInt()))
                .thenReturn(List.of(flight));
        when(flightMapper.toResponse(flight)).thenReturn(mapped);

        List<FlightResponse> result = flightService.searchFlights(request);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).flightNumber()).isEqualTo("AF1234");
    }

    @Test
    void getFlightById_throwsWhenMissing() {
        when(flightRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> flightService.getFlightById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Flight")
                .hasMessageContaining("99");
    }
}
