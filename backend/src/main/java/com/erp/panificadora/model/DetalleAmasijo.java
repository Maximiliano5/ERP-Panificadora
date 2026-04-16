package com.erp.panificadora.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "detalles_amasijo")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetalleAmasijo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "amasijo_id", nullable = false)
    private Amasijo amasijo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mercaderia_id", nullable = false)
    private Mercaderia mercaderia;

    @Column(name = "cantidad_utilizada", nullable = false, precision = 12, scale = 3)
    private BigDecimal cantidadUtilizada;
}
