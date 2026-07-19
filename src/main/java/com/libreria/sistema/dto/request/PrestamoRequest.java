package com.libreria.sistema.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
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
    @Size(max = 50)
    private List<@Valid DetallePrestamoRequest> detalles;
}
