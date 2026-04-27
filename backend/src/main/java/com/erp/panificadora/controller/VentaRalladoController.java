package com.erp.panificadora.controller;

import com.erp.panificadora.dto.VentaRalladoRequestDTO;
import com.erp.panificadora.dto.VentaRalladoResponseDTO;
import com.erp.panificadora.service.VentaRalladoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/ventas-rallado")
@RequiredArgsConstructor
public class VentaRalladoController {

    private final VentaRalladoService ventaRalladoService;

    @PostMapping
    public ResponseEntity<VentaRalladoResponseDTO> registrar(@Valid @RequestBody VentaRalladoRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ventaRalladoService.registrar(dto));
    }

    @GetMapping
    public ResponseEntity<List<VentaRalladoResponseDTO>> listar() {
        return ResponseEntity.ok(ventaRalladoService.listar());
    }

    @GetMapping("/impagas")
    public ResponseEntity<List<VentaRalladoResponseDTO>> impagas() {
        return ResponseEntity.ok(ventaRalladoService.listarImpagas());
    }

    @GetMapping("/por-fecha")
    public ResponseEntity<List<VentaRalladoResponseDTO>> porFecha(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return ResponseEntity.ok(ventaRalladoService.listarPorFecha(fecha));
    }

    @GetMapping("/{id}")
    public ResponseEntity<VentaRalladoResponseDTO> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(ventaRalladoService.obtener(id));
    }
}
