package com.libreria.sistema.exception;

/**
 * Lanzada cuando se intenta registrar un préstamo pero el stock del libro
 * es insuficiente para cubrir la cantidad solicitada.
 * El GlobalExceptionHandler la convierte en HTTP 422 Unprocessable Entity.
 *
 * Esta excepción es clave en el flujo de automatización:
 * Préstamo → validar stock → StockInsuficienteException → HTTP 422
 */
public class StockInsuficienteException extends RuntimeException {

    public StockInsuficienteException(String message) {
        super(message);
    }
}
