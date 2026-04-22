package com.erp.panificadora.dto;

import jakarta.validation.constraints.DecimalMin;
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
public class DetalleCostoInsumoRequestDTO {

    @NotNull(message = "La mercadería es requerida")
    private Long mercaderiaId;

    @NotNull(message = "El porcentaje de uso es requerido")
    @DecimalMin(value = "0.01", message = "El porcentaje de uso debe ser mayor a 0")
    private BigDecimal porcentajeUso;
}
