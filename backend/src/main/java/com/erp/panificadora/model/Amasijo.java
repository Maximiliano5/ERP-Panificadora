package com.erp.panificadora.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "amasijos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Amasijo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produccion_id", nullable = false)
    private Produccion produccion;

    @Column(name = "cantidad_pan_producido", precision = 12, scale = 3)
    private BigDecimal cantidadPanProducido;

    @OneToMany(mappedBy = "amasijo", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<DetalleAmasijo> detalles = new ArrayList<>();
}
