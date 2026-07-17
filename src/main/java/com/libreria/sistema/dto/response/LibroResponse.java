package com.libreria.sistema.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LibroResponse {
    private Long id;
    private String titulo;
    private String isbn;
    private BigDecimal precio;
    private Integer stock;
    private String descripcion;
    private String autorNombre;
    private Long categoriaId;
    private String categoriaNombre;
    private LocalDateTime fechaCreacion;
}
