package com.libreria.sistema.entity;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class LibroTest {

    @Test
    void actualizarStockPermiteSumarYRestarSinBajarDeCero() {
        Libro libro = Libro.builder().stock(5).build();

        libro.actualizarStock(-2);

        assertEquals(3, libro.getStock());
    }

    @Test
    void actualizarStockRechazaResultadoNegativo() {
        Libro libro = Libro.builder().stock(1).build();

        assertThrows(IllegalStateException.class, () -> libro.actualizarStock(-2));
        assertEquals(1, libro.getStock());
    }
}
