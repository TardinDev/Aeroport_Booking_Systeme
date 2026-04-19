package com.skybooker.repository;

import com.skybooker.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    boolean existsByBookingReference(String bookingReference);

    @Query("""
            SELECT b FROM Booking b
            JOIN FETCH b.flight f
            JOIN FETCH f.airline
            JOIN FETCH f.origin
            JOIN FETCH f.destination
            WHERE b.user.id = :userId
            ORDER BY b.createdAt DESC
            """)
    List<Booking> findAllByUserId(Long userId);

    @Query("""
            SELECT b FROM Booking b
            JOIN FETCH b.flight f
            JOIN FETCH f.airline
            JOIN FETCH f.origin
            JOIN FETCH f.destination
            WHERE b.id = :id
            """)
    Optional<Booking> findByIdWithFlight(Long id);
}
