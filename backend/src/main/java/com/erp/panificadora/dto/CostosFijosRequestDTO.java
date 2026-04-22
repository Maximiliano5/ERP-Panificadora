package com.erp.panificadora.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CostosFijosRequestDTO {

    @NotNull(message = "El costo de amasado es requerido")
    @DecimalMin(value = "0.0", message = "Debe ser mayor o igual a 0")
    private BigDecimal costoAmasado;

    @NotNull(message = "El costo de cocción es requerido")
    @DecimalMin(value = "0.0", message = "Debe ser mayor o igual a 0")
    private BigDecimal costoCoccion;

    @NotNull(message = "El costo de corte es requerido")
    @DecimalMin(value = "0.0", message = "Debe ser mayor o igual a 0")
    private BigDecimal costoCorte;

    @NotNull(message = "El costo de distribución es requerido")
    @DecimalMin(value = "0.0", message = "Debe ser mayor o igual a 0")
    private BigDecimal costoDistribucion;

    @NotNull(message = "El costo de electricidad es requerido")
    @DecimalMin(value = "0.0", message = "Debe ser mayor o igual a 0")
    private BigDecimal costoElectricidad;

    @NotNull(message = "El costo de agua es requerido")
    @DecimalMin(value = "0.0", message = "Debe ser mayor o igual a 0")
    private BigDecimal costoAgua;

    @NotNull(message = "El costo de gas es requerido")
    @DecimalMin(value = "0.0", message = "Debe ser mayor o igual a 0")
    private BigDecimal costoGas;

    @Valid
    private List<CostoAdicionalDTO> costosAdicionales = new ArrayList<>();
}
