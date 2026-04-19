package com.skybooker.controller;

import com.skybooker.dto.request.CreateBookingRequest;
import com.skybooker.dto.response.BookingResponse;
import com.skybooker.security.CurrentUser;
import com.skybooker.service.BookingService;
import com.skybooker.service.PdfService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Bookings", description = "Create, list, cancel and download bookings (authenticated)")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/v1/bookings")
public class BookingController {

    private final BookingService bookingService;
    private final PdfService pdfService;

    public BookingController(BookingService bookingService, PdfService pdfService) {
        this.bookingService = bookingService;
        this.pdfService = pdfService;
    }

    @Operation(summary = "Create a booking for the current user")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookingResponse create(@Valid @RequestBody CreateBookingRequest request, Authentication authentication) {
        Long userId = CurrentUser.userId(authentication);
        return bookingService.createBooking(request, userId);
    }

    @Operation(summary = "List bookings of the currently authenticated user")
    @GetMapping("/my")
    public List<BookingResponse> myBookings(Authentication authentication) {
        Long userId = CurrentUser.userId(authentication);
        return bookingService.getMyBookings(userId);
    }

    @Operation(summary = "Fetch a booking by id (must be owner unless ADMIN/AGENT)")
    @GetMapping("/{id}")
    public BookingResponse getById(@PathVariable Long id, Authentication authentication) {
        return bookingService.getBookingById(id, CurrentUser.userId(authentication), CurrentUser.role(authentication));
    }

    @Operation(summary = "Cancel a booking and release its seats")
    @PatchMapping("/{id}/cancel")
    public BookingResponse cancel(@PathVariable Long id, Authentication authentication) {
        return bookingService.cancelBooking(id, CurrentUser.userId(authentication), CurrentUser.role(authentication));
    }

    @Operation(summary = "Download the ticket (PDF) for a booking")
    @GetMapping(value = "/{id}/ticket.pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<Resource> downloadTicket(@PathVariable Long id, Authentication authentication) {
        Long userId = CurrentUser.userId(authentication);
        byte[] pdf = pdfService.generateTicketPdf(id, userId, CurrentUser.role(authentication));
        String filename = "ticket-" + id + ".pdf";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(pdf.length)
                .body(new ByteArrayResource(pdf));
    }
}
