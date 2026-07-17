package com.libreria.sistema.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DetallePrestamoRequest {

    @NotNull
    private Long libroId;

    @Min(1)
    private Integer cantidad;
}
