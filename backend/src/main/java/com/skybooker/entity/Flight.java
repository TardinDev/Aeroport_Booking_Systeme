package com.skybooker.entity;

import com.skybooker.enums.FlightStatus;
import com.skybooker.enums.SeatClass;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "flights", indexes = {
        @Index(name = "idx_flights_number", columnList = "flight_number"),
        @Index(name = "idx_flights_origin", columnList = "origin_code"),
        @Index(name = "idx_flights_destination", columnList = "destination_code"),
        @Index(name = "idx_flights_departure", columnList = "departure_time"),
        @Index(name = "idx_flights_status", columnList = "status")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Flight {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "flight_number", nullable = false)
    private String flightNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "airline_id", nullable = false)
    private Airline airline;

    @Column(name = "origin_code", nullable = false, length = 3)
    private String originCode;

    @Column(name = "origin_name")
    private String originName;

    @Column(name = "origin_city")
    private String originCity;

    @Column(name = "origin_country")
    private String originCountry;

    @Column(name = "destination_code", nullable = false, length = 3)
    private String destinationCode;

    @Column(name = "destination_name")
    private String destinationName;

    @Column(name = "destination_city")
    private String destinationCity;

    @Column(name = "destination_country")
    private String destinationCountry;

    @Column(name = "departure_time", nullable = false)
    private LocalDateTime departureTime;

    @Column(name = "arrival_time", nullable = false)
    private LocalDateTime arrivalTime;

    @Column(nullable = false)
    private int duration;

    @Column(name = "base_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal basePrice;

    @Column(length = 3)
    @Builder.Default
    private String currency = "EUR";

    @Enumerated(EnumType.STRING)
    @Column(name = "seat_class", nullable = false)
    private SeatClass seatClass;

    @Column(name = "total_seats", nullable = false)
    private int totalSeats;

    @Column(name = "available_seats", nullable = false)
    private int availableSeats;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private FlightStatus status = FlightStatus.SCHEDULED;

    @Builder.Default
    private int stops = 0;

    /** External deep-link where the flight can be booked (Skyscanner, Kayak, airline site…). */
    @Column(name = "booking_url", length = 1000)
    private String bookingUrl;

    /** Display name of the entity selling the flight (airline direct or OTA/agency). */
    @Column(name = "seller_name", length = 120)
    private String sellerName;

    /** "AIRLINE" (direct) or "AGENCY" (OTA). */
    @Column(name = "seller_type", length = 20)
    private String sellerType;

    /** Logo for the seller (airline or OTA). */
    @Column(name = "seller_logo_url", length = 500)
    private String sellerLogoUrl;
}
