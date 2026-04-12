package com.skybooker.repository;

import com.skybooker.entity.BaggageDeclaration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BaggageDeclarationRepository extends JpaRepository<BaggageDeclaration, UUID> {

    List<BaggageDeclaration> findByBookingId(UUID bookingId);
}
