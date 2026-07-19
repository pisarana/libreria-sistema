package com.libreria.sistema.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "detalle_prestamos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetallePrestamo extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "prestamo_id")
    private Prestamo prestamo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "libro_id")
    private Libro libro;

    @Column(name = "cantidad")
    @Builder.Default
    private Integer cantidad = 1;

    @Column(name = "precio_unitario", nullable = false)
    @Builder.Default
    private BigDecimal precioUnitario = BigDecimal.ZERO;
}
