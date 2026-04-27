package com.erp.panificadora.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClientePerfilResponseDTO {

    private ClienteResponseDTO cliente;
    private BigDecimal totalPanesMiga;
    private BigDecimal totalKgRallado;
    private BigDecimal totalFacturadoMiga;
    private BigDecimal totalFacturadoRallado;
    private List<VentaMigaResponseDTO> ventasMiga;
    private List<VentaRalladoResponseDTO> ventasRallado;
}
