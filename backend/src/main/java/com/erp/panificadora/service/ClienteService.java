package com.erp.panificadora.service;

import com.erp.panificadora.dto.*;
import com.erp.panificadora.exception.ResourceNotFoundException;
import com.erp.panificadora.model.Cliente;
import com.erp.panificadora.repository.ClienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClienteService {

    private final ClienteRepository clienteRepository;

    @Transactional
    public ClienteResponseDTO crear(ClienteRequestDTO dto) {
        Cliente cliente = Cliente.builder()
                .nombre(dto.getNombre())
                .apellido(dto.getApellido())
                .tipo(dto.getTipo())
                .build();
        return toResponseDTO(clienteRepository.save(cliente));
    }

    @Transactional
    public ClienteResponseDTO actualizar(Long id, ClienteRequestDTO dto) {
        Cliente cliente = findActivo(id);
        cliente.setNombre(dto.getNombre());
        cliente.setApellido(dto.getApellido());
        cliente.setTipo(dto.getTipo());
        return toResponseDTO(clienteRepository.save(cliente));
    }

    @Transactional
    public void eliminar(Long id) {
        Cliente cliente = findActivo(id);
        cliente.setActivo(false);
        clienteRepository.save(cliente);
    }

    @Transactional(readOnly = true)
    public List<ClienteResponseDTO> listar() {
        return clienteRepository.findAllByActivoTrue()
                .stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ClienteResponseDTO obtener(Long id) {
        return toResponseDTO(findActivo(id));
    }

    @Transactional(readOnly = true)
    public List<ClienteResponseDTO> listarDeudores() {
        return clienteRepository.findByActivoTrueAndSaldoLessThan(BigDecimal.ZERO)
                .stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ClienteResponseDTO> listarConSaldo() {
        return clienteRepository.findByActivoTrueAndSaldoGreaterThan(BigDecimal.ZERO)
                .stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    @Transactional
    public ClienteResponseDTO actualizarSaldo(Long id, SaldoUpdateDTO dto) {
        Cliente cliente = findActivo(id);
        cliente.setSaldo(dto.getNuevoSaldo());
        return toResponseDTO(clienteRepository.save(cliente));
    }

    @Transactional(readOnly = true)
    public ResumenClientesDTO resumen() {
        return ResumenClientesDTO.builder()
                .totalActivos(clienteRepository.countActivos())
                .cantidadDeudores(clienteRepository.countDeudores())
                .cantidadConSaldo(clienteRepository.countConSaldo())
                .totalDeuda(clienteRepository.sumDeuda())
                .totalSaldoAFavor(clienteRepository.sumSaldoAFavor())
                .build();
    }

    private Cliente findActivo(Long id) {
        return clienteRepository.findByIdAndActivoTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con id: " + id));
    }

    private ClienteResponseDTO toResponseDTO(Cliente c) {
        return ClienteResponseDTO.builder()
                .id(c.getId())
                .nombre(c.getNombre())
                .apellido(c.getApellido())
                .tipo(c.getTipo().name())
                .saldo(c.getSaldo())
                .build();
    }
}
