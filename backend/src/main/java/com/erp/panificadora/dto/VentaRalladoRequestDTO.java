package com.erp.panificadora.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VentaRalladoRequestDTO {

    private LocalDate fecha;

    @NotNull(message = "El cliente es requerido")
    private Long clienteId;

    @NotNull(message = "El peso es requerido")
    @DecimalMin(value = "0.001", message = "El peso debe ser mayor a 0")
    private BigDecimal peso;

    @NotNull(message = "El precio por kg es requerido")
    @DecimalMin(value = "0.01", message = "El precio debe ser mayor a 0")
    private BigDecimal precioPorKg;

    @NotNull(message = "El estado de pago es requerido")
    private Boolean pagado;
}
