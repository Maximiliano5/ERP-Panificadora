package com.erp.panificadora.controller;

import com.erp.panificadora.dto.*;
import com.erp.panificadora.service.ProduccionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/producciones")
@RequiredArgsConstructor
public class ProduccionController {

    private final ProduccionService produccionService;

    @PostMapping
    public ResponseEntity<ProduccionResponseDTO> crear(@Valid @RequestBody ProduccionRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(produccionService.crear(dto));
    }

    @GetMapping
    public ResponseEntity<List<ProduccionResponseDTO>> listar() {
        return ResponseEntity.ok(produccionService.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProduccionResponseDTO> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(produccionService.obtener(id));
    }

    @GetMapping("/consumo-diario")
    public ResponseEntity<List<ConsumoDiarioResponseDTO>> consumoDiario(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return ResponseEntity.ok(produccionService.consumoDiario(fecha));
    }

    @GetMapping("/consumo-mercaderia/{mercaderiaId}")
    public ResponseEntity<List<ConsumoMercaderiaResponseDTO>> consumoPorMercaderia(
            @PathVariable Long mercaderiaId) {
        return ResponseEntity.ok(produccionService.consumoPorMercaderia(mercaderiaId));
    }
}
