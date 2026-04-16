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
public class ConsumoDiarioResponseDTO {

    private Long mercaderiaId;
    private String mercaderiaNombre;
    private BigDecimal totalConsumido;
}
