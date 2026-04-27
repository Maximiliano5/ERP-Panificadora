package com.erp.panificadora.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "detalles_costo_insumo")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetalleCostoInsumo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "costo_produccion_id", nullable = false)
    private CostoProduccion costoProduccion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mercaderia_id", nullable = false)
    private Mercaderia mercaderia;

    @Column(name = "cantidad")
    private Integer cantidad;

    @Column(name = "porcentaje_uso", precision = 8, scale = 2, nullable = false)
    private BigDecimal porcentajeUso;

    @Column(name = "costo_calculado", precision = 12, scale = 4)
    private BigDecimal costoCalculado;
}
