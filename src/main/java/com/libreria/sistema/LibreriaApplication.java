package com.libreria.sistema;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Punto de entrada del sistema de gestión de librería.
 * Arquitectura: MVC por capas (controller → service → repository → entity)
 * Autenticación: Spring Security con sesión HTTP (JSESSIONID)
 */
@SpringBootApplication
public class LibreriaApplication {

    public static void main(String[] args) {
        SpringApplication.run(LibreriaApplication.class, args);
    }
}
