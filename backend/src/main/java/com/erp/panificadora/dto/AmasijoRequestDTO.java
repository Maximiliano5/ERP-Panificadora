package com.erp.panificadora.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AmasijoRequestDTO {

    @PositiveOrZero(message = "La cantidad de pan producido debe ser mayor o igual a 0")
    private BigDecimal cantidadPanProducido;

    @NotEmpty(message = "Cada amasijo debe tener al menos un insumo")
    @Valid
    private List<DetalleAmasijoRequestDTO> insumos;
}
