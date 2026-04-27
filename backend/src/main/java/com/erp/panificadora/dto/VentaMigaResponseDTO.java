package com.erp.panificadora.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VentaMigaResponseDTO {

    private Long id;
    private LocalDate fecha;
    private Long clienteId;
    private String clienteNombre;
    private String tipoPan;
    private BigDecimal cantidad;
    private String unidad;
    private BigDecimal precioUnitario;
    private BigDecimal total;
    private boolean pagado;
}
