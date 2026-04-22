package com.erp.panificadora.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CostosFijosResponseDTO {

    private BigDecimal costoAmasado;
    private BigDecimal costoCoccion;
    private BigDecimal costoCorte;
    private BigDecimal costoDistribucion;
    private BigDecimal costoElectricidad;
    private BigDecimal costoAgua;
    private BigDecimal costoGas;
    private List<CostoAdicionalDTO> costosAdicionales;
    private BigDecimal total;
}
