package com.afperdomo.bodegatech.module.supplier.entity;

import com.afperdomo.bodegatech.common.audit.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
    name = "suppliers",
    indexes = {
        @Index(name = "idx_suppliers_nit_unique", columnList = "nit", unique = true),
        @Index(name = "idx_suppliers_is_active", columnList = "is_active")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Supplier extends BaseEntity {

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "nit", nullable = false, length = 50, unique = true)
    private String nit;

    @Column(name = "contact_name", nullable = false, length = 255)
    private String contactName;

    @Column(name = "email", nullable = false, length = 255)
    private String email;

    @Column(name = "phone", nullable = false, length = 30)
    private String phone;

    @Column(name = "address", nullable = false, columnDefinition = "TEXT")
    private String address;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
}
