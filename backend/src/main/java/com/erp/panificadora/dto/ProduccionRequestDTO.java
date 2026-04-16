package com.erp.panificadora.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProduccionRequestDTO {

    @NotNull(message = "La fecha es obligatoria")
    private LocalDate fecha;

    private String observaciones;

    @NotEmpty(message = "Debe incluir al menos un amasijo")
    @Valid
    private List<AmasijoRequestDTO> amasijos;
}
