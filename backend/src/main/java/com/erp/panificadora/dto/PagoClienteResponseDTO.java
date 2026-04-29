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
public class PagoClienteResponseDTO {

    private Long id;
    private Long clienteId;
    private LocalDate fecha;
    private BigDecimal monto;
    private String descripcion;
    private String tipoPago;
}
