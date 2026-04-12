package com.skybooker.repository;

import com.skybooker.entity.Booking;
import com.skybooker.enums.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {

    @Query("SELECT b FROM Booking b JOIN FETCH b.flight f JOIN FETCH f.airline JOIN FETCH b.user WHERE b.user.id = :userId ORDER BY b.createdAt DESC")
    List<Booking> findByUserId(@Param("userId") UUID userId);

    @Query("SELECT b FROM Booking b JOIN FETCH b.flight f JOIN FETCH f.airline JOIN FETCH b.user WHERE b.bookingReference = :reference")
    Optional<Booking> findByBookingReference(@Param("reference") String reference);

    @Query("SELECT b FROM Booking b JOIN FETCH b.flight f JOIN FETCH f.airline JOIN FETCH b.user WHERE b.id = :id")
    Optional<Booking> findByIdWithDetails(@Param("id") UUID id);

    long countByStatus(BookingStatus status);

    Page<Booking> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
