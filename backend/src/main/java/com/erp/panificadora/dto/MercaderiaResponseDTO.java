package com.erp.panificadora.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MercaderiaResponseDTO {
    private Long id;
    private String nombre;
    private BigDecimal precioUnitario;
    private BigDecimal cantidadActual;
    private BigDecimal valorTotal;
}
