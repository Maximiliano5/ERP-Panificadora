package com.erp.panificadora.controller;

import com.erp.panificadora.dto.CostoProduccionRequestDTO;
import com.erp.panificadora.dto.CostoProduccionResponseDTO;
import com.erp.panificadora.service.CostoProduccionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/costos-produccion")
@RequiredArgsConstructor
public class CostoProduccionController {

    private final CostoProduccionService service;

    @PostMapping
    public ResponseEntity<CostoProduccionResponseDTO> crear(@Valid @RequestBody CostoProduccionRequestDTO dto) {
        return ResponseEntity.ok(service.crear(dto));
    }

    @GetMapping
    public ResponseEntity<List<CostoProduccionResponseDTO>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CostoProduccionResponseDTO> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(service.obtener(id));
    }
}
