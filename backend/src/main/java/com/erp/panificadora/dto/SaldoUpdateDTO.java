package com.erp.panificadora.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SaldoUpdateDTO {

    private BigDecimal saldoMiga;
    private BigDecimal saldoRallado;
}
