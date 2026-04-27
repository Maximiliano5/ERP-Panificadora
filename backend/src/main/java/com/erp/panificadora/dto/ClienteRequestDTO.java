package com.erp.panificadora.dto;

import com.erp.panificadora.model.TipoCliente;
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
public class ClienteRequestDTO {

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotBlank(message = "El apellido es obligatorio")
    private String apellido;

    @NotNull(message = "El tipo es obligatorio")
    private TipoCliente tipo;

    private String direccion;

    @DecimalMin(value = "0.01", message = "El precio de miga debe ser mayor a 0")
    private BigDecimal precioMiga;

    @DecimalMin(value = "0.01", message = "El precio de rallado debe ser mayor a 0")
    private BigDecimal precioRallado;
}
