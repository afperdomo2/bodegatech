package com.afperdomo.bodegatech.common.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.util.List;

/**
 * Respuesta paginada de la API.
 * Envuelve datos paginados con metadatos de paginación optimizados.
 * Elimina metadatos innecesarios de Spring Page para reducir el tamaño de la respuesta.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PagedResponse<T> {

    private List<T> items;
    private long totalElements;
    private int totalPages;
    private int currentPage;
    private int pageSize;
    private boolean isLast;

    /**
     * Constructor a partir de un Page de Spring.
     * 
     * @param page Page de Spring con datos paginados
     */
    public PagedResponse(Page<T> page) {
        this.items = page.getContent();
        this.totalElements = page.getTotalElements();
        this.totalPages = page.getTotalPages();
        this.currentPage = page.getNumber();
        this.pageSize = page.getSize();
        this.isLast = page.isLast();
    }
}
