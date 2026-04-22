package com.afperdomo.bodegatech.common.audit;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Clase base para todas las entidades con auditoría.
 * Proporciona campos comunes: id, createdAt, updatedAt y version.
 *
 * <p>El campo {@code version} habilita optimistic locking (JPA @Version):
 * Hibernate lo incrementa automáticamente en cada UPDATE y lanza
 * {@link jakarta.persistence.OptimisticLockException} si detecta que otro
 * proceso modificó la fila entre la lectura y la escritura.
 */
@Getter
@Setter
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    /**
     * Campo de versión para optimistic locking.
     * Gestionado exclusivamente por Hibernate — no asignar manualmente.
     */
    @Version
    @Column(nullable = false)
    private Long version;
}
