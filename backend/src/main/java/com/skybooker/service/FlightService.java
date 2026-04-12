package com.skybooker.service;

import com.skybooker.dto.request.FlightSearchRequest;
import com.skybooker.dto.response.FlightResponse;
import com.skybooker.dto.response.FlightSearchResponse;
import com.skybooker.dto.response.SeatMapResponse;
import com.skybooker.dto.response.SeatResponse;
import com.skybooker.entity.Flight;
import com.skybooker.entity.Seat;
import com.skybooker.enums.FlightStatus;
import com.skybooker.enums.SeatStatus;
import com.skybooker.exception.ResourceNotFoundException;
import com.skybooker.mapper.FlightMapper;
import com.skybooker.mapper.SeatMapper;
import com.skybooker.repository.FlightRepository;
import com.skybooker.repository.SeatRepository;
import com.skybooker.service.flight.FlightGeneratorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class FlightService {

    private final FlightRepository flightRepository;
    private final SeatRepository seatRepository;
    private final FlightMapper flightMapper;
    private final SeatMapper seatMapper;
    private final FlightGeneratorService flightGeneratorService;

    @Transactional(readOnly = true)
    public FlightSearchResponse searchFlights(FlightSearchRequest request, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        // Always pass non-null sentinel dates — PostgreSQL's JDBC driver
        // can't infer the type of a timestamp parameter used only in an
        // `IS NULL` check, so we avoid the pattern entirely by bounding
        // the query between two real LocalDateTime values.
        LocalDateTime departureFrom;
        LocalDateTime departureTo;
        if (request.departureDate() != null) {
            departureFrom = request.departureDate().atStartOfDay();
            departureTo = request.departureDate().atTime(LocalTime.MAX);
        } else {
            departureFrom = LocalDateTime.now();
            departureTo = LocalDateTime.now().plusYears(5);
        }

        int minSeats = request.passengers() != null ? request.passengers() : 1;

        // Try the DB (matches either by IATA code or by city name, case-insensitive)
        Page<Flight> flightPage = flightRepository.searchFlights(
                request.origin(),
                request.destination(),
                departureFrom,
                departureTo,
                request.seatClass(),
                minSeats,
                FlightStatus.SCHEDULED,
                pageable
        );

        List<FlightResponse> flights = flightPage.getContent().stream()
                .map(flightMapper::toResponse)
                .toList();

        // Fallback — if the DB returned nothing, generate plausible flights
        // on the fly so the user always sees real-looking results with
        // working booking deep-links. Only runs when the caller provided
        // both endpoints (otherwise we can't generate anything meaningful).
        if (flights.isEmpty()
                && request.origin() != null && !request.origin().isBlank()
                && request.destination() != null && !request.destination().isBlank()) {
            log.info("No DB match for {} → {}; generating mock results",
                    request.origin(), request.destination());
            List<FlightResponse> generated = flightGeneratorService.generate(
                    request.origin(),
                    request.destination(),
                    request.departureDate(),
                    request.seatClass(),
                    request.passengers() != null ? request.passengers() : 1,
                    size
            );
            return new FlightSearchResponse(
                    generated,
                    generated.size(),
                    page,
                    size,
                    1
            );
        }

        return new FlightSearchResponse(
                flights,
                flightPage.getTotalElements(),
                flightPage.getNumber(),
                flightPage.getSize(),
                flightPage.getTotalPages()
        );
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "flights", key = "#id")
    public FlightResponse getFlightById(UUID id) {
        Flight flight = flightRepository.findByIdWithAirline(id)
                .orElseThrow(() -> new ResourceNotFoundException("Flight", "id", id));
        return flightMapper.toResponse(flight);
    }

    @Transactional(readOnly = true)
    public SeatMapResponse getFlightSeats(UUID flightId) {
        Flight flight = flightRepository.findByIdWithAirline(flightId)
                .orElseThrow(() -> new ResourceNotFoundException("Flight", "id", flightId));

        List<Seat> seats = seatRepository.findByFlightId(flightId);
        List<SeatResponse> seatResponses = seatMapper.toResponseList(seats);

        long availableCount = seats.stream()
                .filter(s -> s.getStatus() == SeatStatus.AVAILABLE)
                .count();

        return new SeatMapResponse(
                flight.getId(),
                flight.getFlightNumber(),
                seatResponses,
                seats.size(),
                (int) availableCount
        );
    }

    @Transactional
    public FlightResponse createFlight(Flight flight) {
        flight = flightRepository.save(flight);
        log.info("Flight created: {}", flight.getFlightNumber());
        return flightMapper.toResponse(flight);
    }
}
