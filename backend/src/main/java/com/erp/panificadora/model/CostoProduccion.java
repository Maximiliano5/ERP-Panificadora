package com.erp.panificadora.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "costos_produccion")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CostoProduccion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(nullable = false)
    private String nombre;

    @Column(name = "cantidad_unidades_producidas", nullable = false)
    private Integer cantidadUnidadesProducidas;

    @Column(name = "costo_bolsas_unitario", precision = 12, scale = 2, nullable = false)
    private BigDecimal costoBolsasUnitario;

    @Column(name = "costo_total", precision = 14, scale = 2)
    private BigDecimal costoTotal;

    @Column(name = "costo_unitario", precision = 12, scale = 4)
    private BigDecimal costoUnitario;

    @Column(name = "total_insumos", precision = 12, scale = 2)
    private BigDecimal totalInsumos;

    @Column(name = "total_costos_fijos", precision = 12, scale = 2)
    private BigDecimal totalCostosFijos;

    @Column(name = "costo_total_bolsas", precision = 12, scale = 2)
    private BigDecimal costoTotalBolsas;

    @Embedded
    private CostosFijosBase costosFijos;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "costos_adicionales", joinColumns = @JoinColumn(name = "costo_produccion_id"))
    @Builder.Default
    private List<CostoAdicional> costosAdicionales = new ArrayList<>();

    @OneToMany(mappedBy = "costoProduccion", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<DetalleCostoInsumo> detalles = new ArrayList<>();
}
