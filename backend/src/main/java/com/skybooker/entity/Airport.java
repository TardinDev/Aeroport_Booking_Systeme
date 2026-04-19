package com.skybooker.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "airports",
        uniqueConstraints = @UniqueConstraint(name = "uq_airports_iata", columnNames = "iata_code")
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(onlyExplicitlyIncluded = true)
public class Airport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @ToString.Include
    private Long id;

    @Column(name = "iata_code", nullable = false, length = 3)
    @ToString.Include
    private String iataCode;

    @Column(nullable = false, length = 160)
    private String name;

    @Column(nullable = false, length = 120)
    private String city;

    @Column(nullable = false, length = 120)
    private String country;
}
