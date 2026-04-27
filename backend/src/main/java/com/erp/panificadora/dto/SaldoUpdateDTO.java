package com.erp.panificadora.dto;

import jakarta.validation.constraints.NotNull;
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

    @NotNull(message = "El nuevo saldo es obligatorio")
    private BigDecimal nuevoSaldo;
}
