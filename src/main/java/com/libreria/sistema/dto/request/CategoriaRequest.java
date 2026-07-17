package com.libreria.sistema.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CategoriaRequest {

    @NotBlank
    @Size(max = 100)
    private String nombre;

    private String descripcion;
}
