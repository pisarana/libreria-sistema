package com.libreria.sistema.exception;

/**
 * Lanzada cuando se intenta crear un recurso que ya existe (violación de unicidad).
 * El GlobalExceptionHandler la convierte en HTTP 409 Conflict.
 *
 * Ejemplo: registrar un libro con ISBN ya existente.
 */
public class DuplicateResourceException extends RuntimeException {

    public DuplicateResourceException(String message) {
        super(message);
    }
}
