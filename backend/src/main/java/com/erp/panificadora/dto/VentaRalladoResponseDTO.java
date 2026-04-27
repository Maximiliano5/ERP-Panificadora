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
public class VentaRalladoResponseDTO {

    private Long id;
    private LocalDate fecha;
    private Long clienteId;
    private String clienteNombre;
    private BigDecimal peso;
    private BigDecimal precioPorKg;
    private BigDecimal total;
    private boolean pagado;
}
