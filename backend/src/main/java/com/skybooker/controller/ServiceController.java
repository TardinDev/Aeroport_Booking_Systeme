package com.skybooker.controller;

import com.skybooker.dto.request.BaggageRequest;
import com.skybooker.dto.request.TaxiRequest;
import com.skybooker.entity.BaggageDeclaration;
import com.skybooker.entity.TaxiReservation;
import com.skybooker.service.BaggageService;
import com.skybooker.service.TaxiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/services")
@RequiredArgsConstructor
@Tag(name = "Additional Services", description = "Taxi reservations and baggage declarations")
public class ServiceController {

    private final TaxiService taxiService;
    private final BaggageService baggageService;

    @PostMapping("/taxi")
    @Operation(summary = "Book a taxi for airport transfer")
    public ResponseEntity<TaxiReservation> bookTaxi(@Valid @RequestBody TaxiRequest request) {
        TaxiReservation reservation = taxiService.bookTaxi(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(reservation);
    }

    @GetMapping("/taxi/{bookingId}")
    @Operation(summary = "Get taxi reservations for a booking")
    public ResponseEntity<List<TaxiReservation>> getTaxiByBooking(@PathVariable UUID bookingId) {
        List<TaxiReservation> reservations = taxiService.getTaxiByBooking(bookingId);
        return ResponseEntity.ok(reservations);
    }

    @PostMapping("/baggage")
    @Operation(summary = "Declare baggage for a booking")
    public ResponseEntity<BaggageDeclaration> declareBaggage(@Valid @RequestBody BaggageRequest request) {
        BaggageDeclaration declaration = baggageService.declareBaggage(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(declaration);
    }

    @GetMapping("/baggage/{bookingId}")
    @Operation(summary = "Get baggage declarations for a booking")
    public ResponseEntity<List<BaggageDeclaration>> getBaggageByBooking(@PathVariable UUID bookingId) {
        List<BaggageDeclaration> declarations = baggageService.getBaggageByBooking(bookingId);
        return ResponseEntity.ok(declarations);
    }
}
