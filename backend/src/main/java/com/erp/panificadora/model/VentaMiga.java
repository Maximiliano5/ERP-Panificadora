package com.erp.panificadora.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "ventas_miga")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VentaMiga {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate fecha;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_pan", nullable = false)
    private TipoPan tipoPan;

    @Column(nullable = false, precision = 10, scale = 3)
    private BigDecimal cantidad;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UnidadMiga unidad;

    @Column(name = "precio_unitario", nullable = false, precision = 12, scale = 2)
    private BigDecimal precioUnitario;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal total;

    @Column(nullable = false)
    private boolean pagado;

    @Builder.Default
    @Column(name = "monto_pagado", precision = 14, scale = 2)
    private BigDecimal montoPagado = BigDecimal.ZERO;
}
