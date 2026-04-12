package com.skybooker.controller;

import com.skybooker.dto.request.BookingRequest;
import com.skybooker.dto.response.BookingResponse;
import com.skybooker.entity.BoardingPass;
import com.skybooker.security.SecurityUserDetails;
import com.skybooker.service.AuthService;
import com.skybooker.service.BookingService;
import com.skybooker.service.CheckInService;
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
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
@Tag(name = "Bookings", description = "Flight booking management endpoints")
public class BookingController {

    private final BookingService bookingService;
    private final CheckInService checkInService;
    private final AuthService authService;

    @PostMapping
    @Operation(summary = "Create a new flight booking")
    public ResponseEntity<BookingResponse> createBooking(@Valid @RequestBody BookingRequest request) {
        SecurityUserDetails user = authService.getAuthenticatedUser();
        BookingResponse response = bookingService.createBooking(request, user.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "Get all bookings for the current user")
    public ResponseEntity<List<BookingResponse>> getUserBookings() {
        SecurityUserDetails user = authService.getAuthenticatedUser();
        List<BookingResponse> bookings = bookingService.getUserBookings(user.getId());
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get booking details by ID")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable UUID id) {
        BookingResponse response = bookingService.getBookingById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/cancel")
    @Operation(summary = "Cancel a booking")
    public ResponseEntity<BookingResponse> cancelBooking(@PathVariable UUID id) {
        BookingResponse response = bookingService.cancelBooking(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/checkin")
    @Operation(summary = "Check in for a booking and generate boarding passes")
    public ResponseEntity<List<BoardingPass>> checkIn(@PathVariable UUID id) {
        List<BoardingPass> boardingPasses = checkInService.checkIn(id);
        return ResponseEntity.ok(boardingPasses);
    }
}
