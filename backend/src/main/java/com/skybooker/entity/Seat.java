package com.skybooker.entity;

import com.skybooker.enums.SeatClass;
import com.skybooker.enums.SeatStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "seats", indexes = {
        @Index(name = "idx_seats_flight_id", columnList = "flight_id"),
        @Index(name = "idx_seats_status", columnList = "status")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "flight_id", nullable = false)
    private Flight flight;

    @Column(name = "seat_row", nullable = false)
    private int row;

    @Column(name = "seat_column", nullable = false, length = 2)
    private String seatColumn;

    @Enumerated(EnumType.STRING)
    @Column(name = "seat_class", nullable = false)
    private SeatClass seatClass;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private SeatStatus status = SeatStatus.AVAILABLE;

    @Column(precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "is_window")
    private boolean isWindow;

    @Column(name = "is_aisle")
    private boolean isAisle;

    @Column(name = "is_exit")
    private boolean isExit;
}
