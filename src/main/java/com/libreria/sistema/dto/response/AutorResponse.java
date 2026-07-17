package com.libreria.sistema.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AutorResponse {
    private Long id;
    private String nombre;
    private String apellido;
    private String nacionalidad;
    private int totalLibros;
}
