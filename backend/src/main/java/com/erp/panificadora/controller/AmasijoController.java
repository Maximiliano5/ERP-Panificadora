package com.erp.panificadora.controller;

import com.erp.panificadora.dto.AmasijoRequestDTO;
import com.erp.panificadora.dto.AmasijoResponseDTO;
import com.erp.panificadora.service.AmasijoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/amasijos")
@RequiredArgsConstructor
public class AmasijoController {

    private final AmasijoService amasijoService;

    @PutMapping("/{id}")
    public ResponseEntity<AmasijoResponseDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody AmasijoRequestDTO dto) {
        return ResponseEntity.ok(amasijoService.actualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        amasijoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
