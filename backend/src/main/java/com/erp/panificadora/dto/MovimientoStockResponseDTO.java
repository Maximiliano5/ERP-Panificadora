package com.erp.panificadora.dto;

import com.erp.panificadora.model.TipoMovimiento;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovimientoStockResponseDTO {
    private Long id;
    private TipoMovimiento tipo;
    private Long mercaderiaId;
    private String mercaderiaNombre;
    private BigDecimal cantidad;
    private LocalDateTime fecha;
    private String observaciones;
    private String proveedor;
    private String receptor;
    private String motivo;
}
