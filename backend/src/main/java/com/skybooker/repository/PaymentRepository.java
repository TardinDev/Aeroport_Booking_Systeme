package com.skybooker.repository;

import com.skybooker.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    Optional<Payment> findByBookingId(UUID bookingId);

    Optional<Payment> findByStripePaymentIntentId(String stripePaymentIntentId);

    @Query("SELECT p FROM Payment p JOIN p.booking b WHERE b.user.id = :userId ORDER BY p.createdAt DESC")
    List<Payment> findByUserId(@Param("userId") UUID userId);
}
