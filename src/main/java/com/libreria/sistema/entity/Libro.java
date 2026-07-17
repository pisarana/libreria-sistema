package com.libreria.sistema.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "libros")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Libro extends BaseEntity {

    @Column(name = "titulo", length = 255, nullable = false)
    private String titulo;

    @Column(name = "isbn", length = 20, nullable = false)
    private String isbn;

    @Column(name = "precio", precision = 10, scale = 2)
    private BigDecimal precio;

    @Column(name = "stock", columnDefinition = "INTEGER DEFAULT 0")
    private Integer stock = 0;

    @Column(name = "stock_minimo")
    private Integer stockMinimo = 3;

    @Column(name = "fecha_publicacion")
    private LocalDate fechaPublicacion;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "autor_id")
    private Autor autor;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;

    /**
     * Actualiza el stock del libro en la cantidad indicada.
     * Encapsula la regla de negocio: el stock no puede ser negativo.
     *
     * @param cantidad cantidad a sumar (positivo) o restar (negativo)
     * @throws IllegalStateException si el stock resultante sería negativo
     */
    public void actualizarStock(int cantidad) {
        int nuevoStock = this.stock + cantidad;
        if (nuevoStock < 0) {
            throw new IllegalStateException("Stock insuficiente");
        }
        this.stock = nuevoStock;
    }
}
