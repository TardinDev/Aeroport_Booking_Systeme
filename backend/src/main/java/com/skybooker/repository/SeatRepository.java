package com.skybooker.repository;

import com.skybooker.entity.Seat;
import com.skybooker.enums.SeatStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SeatRepository extends JpaRepository<Seat, UUID> {

    List<Seat> findByFlightId(UUID flightId);

    List<Seat> findByFlightIdAndStatus(UUID flightId, SeatStatus status);
}
