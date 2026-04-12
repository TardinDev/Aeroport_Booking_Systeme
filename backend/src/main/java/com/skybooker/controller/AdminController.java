package com.skybooker.controller;

import com.skybooker.audit.AuditLog;
import com.skybooker.audit.AuditService;
import com.skybooker.enums.BookingStatus;
import com.skybooker.repository.BookingRepository;
import com.skybooker.repository.FlightRepository;
import com.skybooker.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Admin dashboard and management endpoints")
public class AdminController {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final FlightRepository flightRepository;
    private final AuditService auditService;

    @GetMapping("/dashboard")
    @Operation(summary = "Get admin dashboard KPI statistics")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        Map<String, Object> dashboard = new HashMap<>();

        dashboard.put("totalUsers", userRepository.count());
        dashboard.put("totalFlights", flightRepository.count());
        dashboard.put("totalBookings", bookingRepository.count());
        dashboard.put("pendingBookings", bookingRepository.countByStatus(BookingStatus.PENDING));
        dashboard.put("confirmedBookings", bookingRepository.countByStatus(BookingStatus.CONFIRMED));
        dashboard.put("cancelledBookings", bookingRepository.countByStatus(BookingStatus.CANCELLED));
        dashboard.put("completedBookings", bookingRepository.countByStatus(BookingStatus.COMPLETED));

        // Calculate total revenue from confirmed and completed bookings
        BigDecimal totalRevenue = bookingRepository.findAll().stream()
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED || b.getStatus() == BookingStatus.COMPLETED)
                .map(b -> b.getTotalPrice())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dashboard.put("totalRevenue", totalRevenue);

        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/bookings")
    @Operation(summary = "Get all bookings paginated (admin only)")
    public ResponseEntity<?> getAllBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        var bookings = bookingRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size));
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/audit-logs")
    @Operation(summary = "Get audit logs (admin only)")
    public ResponseEntity<Page<AuditLog>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        Page<AuditLog> logs = auditService.getAuditLogs(PageRequest.of(page, size));
        return ResponseEntity.ok(logs);
    }
}
