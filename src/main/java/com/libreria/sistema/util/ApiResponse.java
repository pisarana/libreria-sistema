package com.libreria.sistema.util;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;

/**
 * Wrapper genérico para todas las respuestas REST del sistema.
 *
 * Polimorfismo aplicado: el campo {@code data} acepta cualquier tipo T,
 * desde un DTO simple hasta una Page completa con paginación.
 *
 * Estructura de respuesta:
 * {
 *   "success": true,
 *   "message": "Operación exitosa",
 *   "data": { ... }      <- presente solo si no es null
 * }
 */
@Getter
@JsonInclude(JsonInclude.Include.NON_NULL)  // omite campos null en el JSON
public class ApiResponse<T> {

    private final boolean success;
    private final String  message;
    private final T       data;

    // Constructor privado — obliga a usar los factory methods
    private ApiResponse(boolean success, String message, T data) {
        this.success = success;
        this.message = message;
        this.data    = data;
    }

    /** Respuesta exitosa con datos */
    public static <T> ApiResponse<T> ok(String message, T data) {
        return new ApiResponse<>(true, message, data);
    }

    /** Respuesta exitosa sin datos (ej: DELETE) */
    public static <T> ApiResponse<T> ok(String message) {
        return new ApiResponse<>(true, message, null);
    }

    /** Alias de ok(message, data) — compatibilidad con controllers generados */
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, "Operación exitosa", data);
    }

    /** Alias de ok(message) — compatibilidad con controllers generados */
    public static <T> ApiResponse<T> success(String message) {
        return new ApiResponse<>(true, message, null);
    }

    /** Respuesta de error */
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message, null);
    }
}
