package com.skybooker.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "airlines", indexes = {
        @Index(name = "idx_airlines_code", columnList = "code", unique = true)
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Airline {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true, length = 3)
    private String code;

    @Column(name = "logo_url")
    private String logoUrl;

    private String country;

    @Builder.Default
    private boolean active = true;
}
