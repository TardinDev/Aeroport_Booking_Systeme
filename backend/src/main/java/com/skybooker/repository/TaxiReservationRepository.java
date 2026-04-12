package com.skybooker.repository;

import com.skybooker.entity.TaxiReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TaxiReservationRepository extends JpaRepository<TaxiReservation, UUID> {

    List<TaxiReservation> findByBookingId(UUID bookingId);
}
