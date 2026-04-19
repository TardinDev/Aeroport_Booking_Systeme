package com.skybooker.repository;

import com.skybooker.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import jakarta.persistence.LockModeType;
import java.util.List;

public interface SeatRepository extends JpaRepository<Seat, Long> {

    @Query("SELECT s FROM Seat s JOIN FETCH s.flight WHERE s.flight.id = :flightId ORDER BY s.rowNumber ASC, s.seatColumn ASC")
    List<Seat> findByFlightIdOrdered(Long flightId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Seat s WHERE s.id IN :ids")
    List<Seat> lockByIds(List<Long> ids);
}
