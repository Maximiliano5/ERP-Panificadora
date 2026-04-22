package com.erp.panificadora.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
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
public class CostoAdicionalDTO {

    @NotBlank(message = "El nombre del costo adicional es requerido")
    private String nombre;

    @NotNull(message = "El monto es requerido")
    @DecimalMin(value = "0.0", message = "El monto debe ser mayor o igual a 0")
    private BigDecimal monto;
}
