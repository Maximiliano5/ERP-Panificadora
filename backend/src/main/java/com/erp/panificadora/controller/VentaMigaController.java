package com.erp.panificadora.controller;

import com.erp.panificadora.dto.VentaMigaRequestDTO;
import com.erp.panificadora.dto.VentaMigaResponseDTO;
import com.erp.panificadora.service.VentaMigaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/ventas-miga")
@RequiredArgsConstructor
public class VentaMigaController {

    private final VentaMigaService ventaMigaService;

    @PostMapping
    public ResponseEntity<VentaMigaResponseDTO> registrar(@Valid @RequestBody VentaMigaRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ventaMigaService.registrar(dto));
    }

    @GetMapping
    public ResponseEntity<List<VentaMigaResponseDTO>> listar() {
        return ResponseEntity.ok(ventaMigaService.listar());
    }

    @GetMapping("/impagas")
    public ResponseEntity<List<VentaMigaResponseDTO>> impagas() {
        return ResponseEntity.ok(ventaMigaService.listarImpagas());
    }

    @GetMapping("/por-fecha")
    public ResponseEntity<List<VentaMigaResponseDTO>> porFecha(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return ResponseEntity.ok(ventaMigaService.listarPorFecha(fecha));
    }

    @GetMapping("/{id}")
    public ResponseEntity<VentaMigaResponseDTO> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(ventaMigaService.obtener(id));
    }
}
