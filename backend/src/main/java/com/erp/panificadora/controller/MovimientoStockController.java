package com.erp.panificadora.controller;

import com.erp.panificadora.dto.MovimientoStockRequestDTO;
import com.erp.panificadora.dto.MovimientoStockResponseDTO;
import com.erp.panificadora.service.MovimientoStockService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/movimientos")
@RequiredArgsConstructor
public class MovimientoStockController {

    private final MovimientoStockService movimientoStockService;

    @PostMapping
    public ResponseEntity<MovimientoStockResponseDTO> registrar(
            @Valid @RequestBody MovimientoStockRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(movimientoStockService.registrar(dto));
    }

    @GetMapping
    public ResponseEntity<List<MovimientoStockResponseDTO>> listar() {
        return ResponseEntity.ok(movimientoStockService.listar());
    }

    @GetMapping("/mercaderia/{mercaderiaId}")
    public ResponseEntity<List<MovimientoStockResponseDTO>> listarPorMercaderia(
            @PathVariable Long mercaderiaId) {
        return ResponseEntity.ok(movimientoStockService.listarPorMercaderia(mercaderiaId));
    }
}
