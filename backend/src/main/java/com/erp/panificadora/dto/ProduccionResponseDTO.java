package com.erp.panificadora.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProduccionResponseDTO {

    private Long id;
    private LocalDate fecha;
    private String observaciones;
    private List<AmasijoResponseDTO> amasijos;
}
