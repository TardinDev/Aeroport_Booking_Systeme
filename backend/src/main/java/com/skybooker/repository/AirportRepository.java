package com.skybooker.repository;

import com.skybooker.entity.Airport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AirportRepository extends JpaRepository<Airport, Long> {

    Optional<Airport> findByIataCodeIgnoreCase(String iataCode);
}
