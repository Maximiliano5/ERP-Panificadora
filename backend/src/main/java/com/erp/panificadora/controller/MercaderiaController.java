package com.erp.panificadora.controller;

import com.erp.panificadora.dto.MercaderiaRequestDTO;
import com.erp.panificadora.dto.MercaderiaResponseDTO;
import com.erp.panificadora.dto.ValorStockResponseDTO;
import com.erp.panificadora.service.MercaderiaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mercaderias")
@RequiredArgsConstructor
public class MercaderiaController {

    private final MercaderiaService mercaderiaService;

    @PostMapping
    public ResponseEntity<MercaderiaResponseDTO> crear(@Valid @RequestBody MercaderiaRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(mercaderiaService.crear(dto));
    }

    @GetMapping
    public ResponseEntity<List<MercaderiaResponseDTO>> listar(
            @RequestParam(required = false) String nombre) {
        return ResponseEntity.ok(mercaderiaService.listar(nombre));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MercaderiaResponseDTO> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(mercaderiaService.obtener(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MercaderiaResponseDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody MercaderiaRequestDTO dto) {
        return ResponseEntity.ok(mercaderiaService.actualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        mercaderiaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/valor-total")
    public ResponseEntity<ValorStockResponseDTO> valorTotal(
            @RequestParam(required = false) String nombre) {
        return ResponseEntity.ok(mercaderiaService.calcularValorTotal(nombre));
    }
}
