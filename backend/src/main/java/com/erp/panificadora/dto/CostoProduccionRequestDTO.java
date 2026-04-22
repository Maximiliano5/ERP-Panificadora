package com.erp.panificadora.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
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
public class CostoProduccionRequestDTO {

    @NotBlank(message = "El nombre es requerido")
    private String nombre;

    @NotNull(message = "La cantidad de unidades es requerida")
    @Min(value = 1, message = "Debe producir al menos 1 unidad")
    private Integer cantidadUnidadesProducidas;

    @NotNull(message = "El costo por bolsa es requerido")
    @DecimalMin(value = "0.0", message = "El costo de bolsas debe ser mayor o igual a 0")
    private BigDecimal costoBolsasUnitario;

    @NotEmpty(message = "Debe incluir al menos un insumo")
    @Valid
    private List<DetalleCostoInsumoRequestDTO> insumos;

    @NotNull(message = "Los costos fijos son requeridos")
    @Valid
    private CostosFijosRequestDTO costosFijos;
}
