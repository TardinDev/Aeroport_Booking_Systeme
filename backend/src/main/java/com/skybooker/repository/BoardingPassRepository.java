package com.skybooker.repository;

import com.skybooker.entity.BoardingPass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface BoardingPassRepository extends JpaRepository<BoardingPass, UUID> {

    Optional<BoardingPass> findByBookingIdAndPassengerId(UUID bookingId, UUID passengerId);

    java.util.List<BoardingPass> findByBookingId(UUID bookingId);
}
