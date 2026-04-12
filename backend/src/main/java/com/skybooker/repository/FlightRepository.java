package com.skybooker.repository;

import com.skybooker.entity.Flight;
import com.skybooker.enums.FlightStatus;
import com.skybooker.enums.SeatClass;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.UUID;

@Repository
public interface FlightRepository extends JpaRepository<Flight, UUID> {

    @Query("""
            SELECT f FROM Flight f
            JOIN FETCH f.airline a
            WHERE (:origin IS NULL
                   OR LOWER(f.originCode) = LOWER(:origin)
                   OR LOWER(f.originCity) LIKE LOWER(CONCAT('%', :origin, '%'))
                   OR LOWER(f.originName) LIKE LOWER(CONCAT('%', :origin, '%')))
            AND (:destination IS NULL
                   OR LOWER(f.destinationCode) = LOWER(:destination)
                   OR LOWER(f.destinationCity) LIKE LOWER(CONCAT('%', :destination, '%'))
                   OR LOWER(f.destinationName) LIKE LOWER(CONCAT('%', :destination, '%')))
            AND f.departureTime >= :departureFrom
            AND f.departureTime <= :departureTo
            AND (:seatClass IS NULL OR f.seatClass = :seatClass)
            AND f.availableSeats >= :minSeats
            AND f.status = :status
            ORDER BY f.departureTime ASC
            """)
    Page<Flight> searchFlights(
            @Param("origin") String origin,
            @Param("destination") String destination,
            @Param("departureFrom") LocalDateTime departureFrom,
            @Param("departureTo") LocalDateTime departureTo,
            @Param("seatClass") SeatClass seatClass,
            @Param("minSeats") int minSeats,
            @Param("status") FlightStatus status,
            Pageable pageable
    );

    @Query("SELECT f FROM Flight f JOIN FETCH f.airline WHERE f.id = :id")
    java.util.Optional<Flight> findByIdWithAirline(@Param("id") UUID id);
}
