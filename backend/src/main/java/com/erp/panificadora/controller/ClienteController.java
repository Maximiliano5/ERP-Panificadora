package com.erp.panificadora.controller;

import com.erp.panificadora.dto.*;
import com.erp.panificadora.service.ClienteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clientes")
@RequiredArgsConstructor
public class ClienteController {

    private final ClienteService clienteService;

    @PostMapping
    public ResponseEntity<ClienteResponseDTO> crear(@Valid @RequestBody ClienteRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(clienteService.crear(dto));
    }

    @GetMapping
    public ResponseEntity<List<ClienteResponseDTO>> listar() {
        return ResponseEntity.ok(clienteService.listar());
    }

    @GetMapping("/deudores")
    public ResponseEntity<List<ClienteResponseDTO>> deudores() {
        return ResponseEntity.ok(clienteService.listarDeudores());
    }

    @GetMapping("/con-saldo")
    public ResponseEntity<List<ClienteResponseDTO>> conSaldo() {
        return ResponseEntity.ok(clienteService.listarConSaldo());
    }

    @GetMapping("/resumen")
    public ResponseEntity<ResumenClientesDTO> resumen() {
        return ResponseEntity.ok(clienteService.resumen());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClienteResponseDTO> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(clienteService.obtener(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClienteResponseDTO> actualizar(
            @PathVariable Long id, @Valid @RequestBody ClienteRequestDTO dto) {
        return ResponseEntity.ok(clienteService.actualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        clienteService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/saldo")
    public ResponseEntity<ClienteResponseDTO> actualizarSaldo(
            @PathVariable Long id, @Valid @RequestBody SaldoUpdateDTO dto) {
        return ResponseEntity.ok(clienteService.actualizarSaldo(id, dto));
    }
}
