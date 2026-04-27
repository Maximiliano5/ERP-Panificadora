package com.erp.panificadora.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "clientes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private String apellido;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoCliente tipo;

    @Column
    private String direccion;

    @Column(name = "precio_miga", precision = 12, scale = 2)
    private BigDecimal precioMiga;

    @Column(name = "precio_rallado", precision = 12, scale = 2)
    private BigDecimal precioRallado;

    @Builder.Default
    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal saldo = BigDecimal.ZERO;

    @Builder.Default
    @Column(nullable = false)
    private boolean activo = true;
}
