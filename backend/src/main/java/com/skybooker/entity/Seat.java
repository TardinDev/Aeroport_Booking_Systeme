package com.skybooker.entity;

import com.skybooker.enums.SeatClass;
import com.skybooker.enums.SeatStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(
        name = "seats",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_seats_flight_row_col",
                columnNames = {"flight_id", "row_number", "seat_column"}
        ),
        indexes = @Index(name = "idx_seats_flight_status", columnList = "flight_id,status")
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(onlyExplicitlyIncluded = true)
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @ToString.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "flight_id", nullable = false, foreignKey = @ForeignKey(name = "fk_seats_flight"))
    private Flight flight;

    @Column(name = "row_number", nullable = false)
    @ToString.Include
    private int rowNumber;

    @Column(name = "seat_column", nullable = false, length = 1)
    @ToString.Include
    private String seatColumn;

    @Enumerated(EnumType.STRING)
    @Column(name = "seat_class", nullable = false, length = 20)
    private SeatClass seatClass;

    @Column(name = "price_multiplier", nullable = false, precision = 4, scale = 2)
    private BigDecimal priceMultiplier;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private SeatStatus status = SeatStatus.AVAILABLE;

    /** Human-readable seat label like "12A". */
    public String label() {
        return rowNumber + seatColumn;
    }
}
