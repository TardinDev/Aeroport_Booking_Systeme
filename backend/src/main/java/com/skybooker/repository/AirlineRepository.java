package com.skybooker.repository;

import com.skybooker.entity.Airline;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AirlineRepository extends JpaRepository<Airline, UUID> {

    Optional<Airline> findByCode(String code);

    List<Airline> findByActiveTrue();
}
