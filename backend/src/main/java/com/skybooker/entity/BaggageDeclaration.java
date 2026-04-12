package com.skybooker.entity;

import com.skybooker.enums.BaggageType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "baggage_declarations", indexes = {
        @Index(name = "idx_baggage_booking_id", columnList = "booking_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BaggageDeclaration {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BaggageType type;

    @Column(nullable = false)
    private double weight;

    private String dimensions;

    @Column(name = "extra_charge", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal extraCharge = BigDecimal.ZERO;
}
