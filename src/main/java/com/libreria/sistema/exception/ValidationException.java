package com.libreria.sistema.exception;

/**
 * Lanzada cuando una validación de negocio falla en la capa de servicio.
 * El GlobalExceptionHandler la convierte en HTTP 400 Bad Request.
 *
 * Ejemplo: intentar eliminar un autor que tiene libros asociados.
 */
public class ValidationException extends RuntimeException {

    public ValidationException(String message) {
        super(message);
    }
}
