package com.erp.panificadora.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CostoAdicional {

    @Column(name = "nombre_adicional")
    private String nombre;

    @Column(name = "monto_adicional", precision = 12, scale = 2)
    private BigDecimal monto;
}
