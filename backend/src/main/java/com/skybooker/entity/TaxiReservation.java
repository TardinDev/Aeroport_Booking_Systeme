package com.skybooker.entity;

import com.skybooker.enums.TaxiStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "taxi_reservations", indexes = {
        @Index(name = "idx_taxi_booking_id", columnList = "booking_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaxiReservation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @Column(name = "pickup_address", nullable = false)
    private String pickupAddress;

    @Column(name = "pickup_lat")
    private Double pickupLat;

    @Column(name = "pickup_lng")
    private Double pickupLng;

    @Column(name = "pickup_time", nullable = false)
    private LocalDateTime pickupTime;

    @Column(name = "estimated_price", precision = 10, scale = 2)
    private BigDecimal estimatedPrice;

    @Column(name = "estimated_duration")
    private Integer estimatedDuration;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TaxiStatus status = TaxiStatus.PENDING;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
