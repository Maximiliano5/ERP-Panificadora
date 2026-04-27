package com.erp.panificadora.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "ventas_pan_rallado")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VentaPanRallado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate fecha;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @Column(nullable = false, precision = 10, scale = 3)
    private BigDecimal peso;

    @Column(name = "precio_por_kg", nullable = false, precision = 12, scale = 2)
    private BigDecimal precioPorKg;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal total;

    @Column(nullable = false)
    private boolean pagado;
}
