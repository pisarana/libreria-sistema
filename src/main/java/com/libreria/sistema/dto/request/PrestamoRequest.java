package com.libreria.sistema.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class PrestamoRequest {

    @NotNull
    private Long usuarioId;

    private LocalDate fechaDevolucion;

    private String observaciones;

    @NotEmpty
    private List<DetallePrestamoRequest> detalles;
}
