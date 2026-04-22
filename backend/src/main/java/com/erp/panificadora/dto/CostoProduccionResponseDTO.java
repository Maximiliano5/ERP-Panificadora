package com.erp.panificadora.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CostoProduccionResponseDTO {

    private Long id;
    private LocalDate fecha;
    private String nombre;
    private Integer cantidadUnidadesProducidas;
    private BigDecimal costoBolsasUnitario;
    private BigDecimal costoTotal;
    private BigDecimal costoUnitario;
    private BigDecimal totalInsumos;
    private BigDecimal totalCostosFijos;
    private BigDecimal costoTotalBolsas;
    private List<DetalleCostoInsumoResponseDTO> insumos;
    private CostosFijosResponseDTO costosFijos;
}
