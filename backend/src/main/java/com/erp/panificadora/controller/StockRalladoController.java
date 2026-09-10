package com.erp.panificadora.controller;

import com.erp.panificadora.dto.MovimientoStockRalladoResponseDTO;
import com.erp.panificadora.dto.StockRalladoActualResponseDTO;
import com.erp.panificadora.dto.StockRalladoIngresoRequestDTO;
import com.erp.panificadora.service.StockRalladoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stock-rallado")
@RequiredArgsConstructor
public class StockRalladoController {

    private final StockRalladoService stockRalladoService;

    @PostMapping("/ingresos")
    public ResponseEntity<MovimientoStockRalladoResponseDTO> registrarIngreso(
            @Valid @RequestBody StockRalladoIngresoRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(stockRalladoService.registrarIngreso(dto));
    }

    @GetMapping("/actual")
    public ResponseEntity<StockRalladoActualResponseDTO> obtenerStockActual() {
        return ResponseEntity.ok(StockRalladoActualResponseDTO.builder()
                .stockActualKg(stockRalladoService.obtenerStockActual())
                .build());
    }

    @GetMapping("/movimientos")
    public ResponseEntity<List<MovimientoStockRalladoResponseDTO>> listarMovimientos() {
        return ResponseEntity.ok(stockRalladoService.listarMovimientos());
    }
}
