package com.erp.panificadora.dto;

import com.erp.panificadora.model.TipoMovimiento;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovimientoStockRalladoResponseDTO {

    private Long id;
    private TipoMovimiento tipo;
    private BigDecimal cantidadKg;
    private LocalDate fecha;
    private String observaciones;
}
