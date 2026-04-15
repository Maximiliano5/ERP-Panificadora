package com.erp.panificadora.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "mercaderias")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Mercaderia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(name = "precio_unitario", nullable = false, precision = 12, scale = 2)
    private BigDecimal precioUnitario;

    @Builder.Default
    @Column(nullable = false)
    private boolean activo = true;
}
