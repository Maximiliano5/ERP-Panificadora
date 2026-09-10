package com.erp.panificadora.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "movimientos_stock_rallado")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovimientoStockRallado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private TipoMovimiento tipo;

    @Column(name = "cantidad_kg", nullable = false, precision = 12, scale = 3)
    private BigDecimal cantidadKg;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(length = 500)
    private String observaciones;

    // Presente solo en egresos generados automáticamente por una venta de pan rallado
    @Column(name = "venta_id")
    private Long ventaId;
}
