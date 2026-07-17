package com.libreria.sistema.dto.request;

import com.libreria.sistema.entity.enums.Rol;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class UsuarioRequest {

    @NotBlank
    private String nombre;

    @NotBlank
    private String apellido;

    @NotBlank
    @Email
    private String correo;

    @NotBlank
    @Size(min = 6)
    private String password;

    @NotNull
    private Rol rol;

    private Boolean estado = true;
}
