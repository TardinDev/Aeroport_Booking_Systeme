package com.skybooker.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "agencies")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Agency {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "commission_rate", precision = 5, scale = 2)
    private BigDecimal commissionRate;

    @Builder.Default
    private boolean active = true;
}
