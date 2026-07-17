package com.libreria.sistema.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class LibroRequest {

    @NotBlank
    private String titulo;

    @NotBlank
    @Size(min = 10, max = 20)
    private String isbn;

    @DecimalMin("0.0")
    private BigDecimal precio;

    @Min(0)
    private Integer stock;

    private String descripcion;

    @NotNull
    private Long autorId;

    @NotNull
    private Long categoriaId;
}
