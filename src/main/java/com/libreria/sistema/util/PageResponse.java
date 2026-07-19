package com.libreria.sistema.util;

import lombok.Getter;

import java.util.List;

/** Contrato estable para respuestas paginadas, independiente de PageImpl. */
@Getter
public class PageResponse<T> {

    private final List<T> content;
    private final int number;
    private final int size;
    private final long totalElements;
    private final int totalPages;
    private final boolean first;
    private final boolean last;

    private PageResponse(org.springframework.data.domain.Page<T> page) {
        this.content = page.getContent();
        this.number = page.getNumber();
        this.size = page.getSize();
        this.totalElements = page.getTotalElements();
        this.totalPages = page.getTotalPages();
        this.first = page.isFirst();
        this.last = page.isLast();
    }

    public static <T> PageResponse<T> from(org.springframework.data.domain.Page<T> page) {
        return new PageResponse<>(page);
    }
}
