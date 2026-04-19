package com.skybooker.service;

import com.skybooker.dto.request.FlightSearchRequest;
import com.skybooker.dto.response.FlightResponse;
import com.skybooker.dto.response.SeatResponse;
import com.skybooker.entity.Flight;
import com.skybooker.exception.ResourceNotFoundException;
import com.skybooker.mapper.FlightMapper;
import com.skybooker.repository.FlightRepository;
import com.skybooker.repository.SeatRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class FlightService {

    private final FlightRepository flightRepository;
    private final SeatRepository seatRepository;
    private final FlightMapper flightMapper;

    public FlightService(FlightRepository flightRepository, SeatRepository seatRepository, FlightMapper flightMapper) {
        this.flightRepository = flightRepository;
        this.seatRepository = seatRepository;
        this.flightMapper = flightMapper;
    }

    public List<FlightResponse> searchFlights(FlightSearchRequest request) {
        Instant dayStart = request.departureDate().atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant dayEnd = request.departureDate().plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);

        List<Flight> flights = flightRepository.search(
                request.origin().toUpperCase(),
                request.destination().toUpperCase(),
                dayStart,
                dayEnd,
                request.passengers());

        return flights.stream()
                .map(flightMapper::toResponse)
                .toList();
    }

    public FlightResponse getFlightById(Long id) {
        Flight flight = flightRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Flight", id));
        return flightMapper.toResponse(flight);
    }

    public List<SeatResponse> getSeatsByFlightId(Long flightId) {
        if (!flightRepository.existsById(flightId)) {
            throw ResourceNotFoundException.of("Flight", flightId);
        }
        return seatRepository.findByFlightIdOrdered(flightId).stream()
                .map(flightMapper::toSeatResponse)
                .toList();
    }
}
