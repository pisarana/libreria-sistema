package com.libreria.sistema.exception;

/**
 * Lanzada cuando un recurso solicitado no existe en la base de datos.
 * El GlobalExceptionHandler la convierte en HTTP 404.
 *
 * Ejemplo: buscar un Libro por ID que no existe.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
