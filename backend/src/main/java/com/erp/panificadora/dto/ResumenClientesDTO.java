package com.erp.panificadora.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumenClientesDTO {

    private long totalActivos;
    private long cantidadDeudores;
    private long cantidadConSaldo;
    private BigDecimal totalDeuda;
    private BigDecimal totalSaldoAFavor;
}
