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
public class DetalleAmasijoRequestDTO {

    @NotNull(message = "La mercadería es obligatoria")
    private Long mercaderiaId;

    @NotNull(message = "La cantidad es obligatoria")
    @DecimalMin(value = "0.001", message = "La cantidad debe ser mayor a 0")
    private BigDecimal cantidad;
}
