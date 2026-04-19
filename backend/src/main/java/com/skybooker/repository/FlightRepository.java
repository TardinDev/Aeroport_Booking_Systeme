package com.skybooker.repository;

import com.skybooker.entity.Flight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.List;

public interface FlightRepository extends JpaRepository<Flight, Long> {

    @Query("""
            SELECT f FROM Flight f
            JOIN FETCH f.airline
            JOIN FETCH f.origin o
            JOIN FETCH f.destination d
            WHERE o.iataCode = :originCode
              AND d.iataCode = :destinationCode
              AND f.departureTime >= :dayStart
              AND f.departureTime <  :dayEnd
              AND f.availableSeats >= :minSeats
              AND f.status = com.skybooker.enums.FlightStatus.SCHEDULED
            ORDER BY f.departureTime ASC
            """)
    List<Flight> search(String originCode, String destinationCode,
                        Instant dayStart, Instant dayEnd, int minSeats);
}
