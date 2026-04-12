package com.skybooker.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "boarding_passes", indexes = {
        @Index(name = "idx_bp_booking_id", columnList = "booking_id"),
        @Index(name = "idx_bp_passenger_id", columnList = "passenger_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoardingPass {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "passenger_id", nullable = false)
    private Passenger passenger;

    @Column(name = "qr_code", columnDefinition = "TEXT")
    private String qrCode;

    private String gate;

    @Column(name = "boarding_group")
    private String boardingGroup;

    @Column(name = "pdf_url")
    private String pdfUrl;

    @Column(name = "generated_at")
    private LocalDateTime generatedAt;

    @PrePersist
    protected void onCreate() {
        generatedAt = LocalDateTime.now();
    }
}
