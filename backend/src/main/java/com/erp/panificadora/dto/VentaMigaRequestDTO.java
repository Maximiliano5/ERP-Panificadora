package com.erp.panificadora.dto;

import com.erp.panificadora.model.TipoPan;
import com.erp.panificadora.model.UnidadMiga;
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
public class VentaMigaRequestDTO {

    private LocalDate fecha;

    @NotNull(message = "El cliente es requerido")
    private Long clienteId;

    @NotNull(message = "El tipo de pan es requerido")
    private TipoPan tipoPan;

    @NotNull(message = "La cantidad es requerida")
    @DecimalMin(value = "0.001", message = "La cantidad debe ser mayor a 0")
    private BigDecimal cantidad;

    @NotNull(message = "La unidad es requerida")
    private UnidadMiga unidad;

    @NotNull(message = "El precio unitario es requerido")
    @DecimalMin(value = "0.01", message = "El precio debe ser mayor a 0")
    private BigDecimal precioUnitario;

    @NotNull(message = "El estado de pago es requerido")
    private Boolean pagado;
}
