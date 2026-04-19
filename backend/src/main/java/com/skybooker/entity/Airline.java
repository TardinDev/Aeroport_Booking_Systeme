package com.skybooker.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "airlines",
        uniqueConstraints = @UniqueConstraint(name = "uq_airlines_iata", columnNames = "iata_code")
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(onlyExplicitlyIncluded = true)
public class Airline {

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
}
