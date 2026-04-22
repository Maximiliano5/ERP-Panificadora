package com.erp.panificadora.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CostosFijosBase {

    @Column(name = "costo_amasado", precision = 12, scale = 2)
    private BigDecimal costoAmasado;

    @Column(name = "costo_coccion", precision = 12, scale = 2)
    private BigDecimal costoCoccion;

    @Column(name = "costo_corte", precision = 12, scale = 2)
    private BigDecimal costoCorte;

    @Column(name = "costo_distribucion", precision = 12, scale = 2)
    private BigDecimal costoDistribucion;

    @Column(name = "costo_electricidad", precision = 12, scale = 2)
    private BigDecimal costoElectricidad;

    @Column(name = "costo_agua", precision = 12, scale = 2)
    private BigDecimal costoAgua;

    @Column(name = "costo_gas", precision = 12, scale = 2)
    private BigDecimal costoGas;
}
