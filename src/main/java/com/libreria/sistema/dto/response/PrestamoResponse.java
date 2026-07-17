package com.libreria.sistema.dto.response;

import com.libreria.sistema.entity.enums.EstadoPrestamo;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrestamoResponse {
    private Long id;
    private Long usuarioId;
    private String usuarioNombre;
    private LocalDate fechaPrestamo;
    private LocalDate fechaDevolucion;
    private EstadoPrestamo estado;
    private String observaciones;
    private List<DetallePrestamoResponse> detalles;
    private LocalDateTime fechaCreacion;
}
