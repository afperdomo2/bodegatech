package com.afperdomo.bodegatech.module.warehouse.entity;

import com.afperdomo.bodegatech.common.audit.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
    name = "warehouses",
    indexes = {
        @Index(name = "idx_warehouses_code_unique", columnList = "code", unique = true),
        @Index(name = "idx_warehouses_is_active", columnList = "is_active")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Warehouse extends BaseEntity {

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "code", nullable = false, length = 50, unique = true)
    private String code;

    @Column(name = "location", columnDefinition = "TEXT")
    private String location;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
}
