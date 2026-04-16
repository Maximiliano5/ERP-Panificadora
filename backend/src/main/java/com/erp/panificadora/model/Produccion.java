package com.erp.panificadora.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "producciones")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Produccion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(length = 500)
    private String observaciones;

    @OneToMany(mappedBy = "produccion", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Amasijo> amasijos = new ArrayList<>();
}
