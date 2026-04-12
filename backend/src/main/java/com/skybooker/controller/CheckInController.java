package com.skybooker.controller;

import com.skybooker.entity.BoardingPass;
import com.skybooker.service.BoardingPassPdfService;
import com.skybooker.service.CheckInService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/checkin")
@RequiredArgsConstructor
@Tag(name = "Check-in", description = "Online check-in and boarding pass management")
public class CheckInController {

    private final CheckInService checkInService;
    private final BoardingPassPdfService boardingPassPdfService;

    @PostMapping("/{bookingId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Perform online check-in for a confirmed booking")
    public ResponseEntity<List<BoardingPass>> checkIn(@PathVariable UUID bookingId) {
        return ResponseEntity.ok(checkInService.checkIn(bookingId));
    }

    @GetMapping("/{bookingId}/boarding-pass/{passengerId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Fetch a boarding pass (JSON) for a given passenger")
    public ResponseEntity<BoardingPass> getBoardingPass(
            @PathVariable UUID bookingId,
            @PathVariable UUID passengerId) {
        return ResponseEntity.ok(checkInService.getBoardingPass(bookingId, passengerId));
    }

    @GetMapping("/{bookingId}/boarding-pass/{passengerId}/pdf")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Download a boarding pass as a PDF")
    public ResponseEntity<byte[]> downloadBoardingPassPdf(
            @PathVariable UUID bookingId,
            @PathVariable UUID passengerId) {
        BoardingPass boardingPass = checkInService.getBoardingPass(bookingId, passengerId);
        byte[] pdf = boardingPassPdfService.generate(boardingPass);

        String filename = "boarding-pass-" + boardingPass.getBooking().getBookingReference() + ".pdf";
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(pdf);
    }
}
