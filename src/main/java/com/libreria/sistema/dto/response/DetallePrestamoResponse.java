package com.libreria.sistema.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DetallePrestamoResponse {
    private Long id;
    private Long libroId;
    private String libroTitulo;
    private Integer cantidad;
}
