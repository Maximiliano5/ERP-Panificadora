package com.erp.panificadora.service;

import com.erp.panificadora.dto.VentaRalladoRequestDTO;
import com.erp.panificadora.dto.VentaRalladoResponseDTO;
import com.erp.panificadora.exception.ResourceNotFoundException;
import com.erp.panificadora.model.Cliente;
import com.erp.panificadora.model.VentaPanRallado;
import com.erp.panificadora.repository.ClienteRepository;
import com.erp.panificadora.repository.VentaRalladoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VentaRalladoService {

    private final VentaRalladoRepository ventaRalladoRepository;
    private final ClienteRepository clienteRepository;

    @Transactional
    public VentaRalladoResponseDTO registrar(VentaRalladoRequestDTO dto) {
        Cliente cliente = clienteRepository.findByIdAndActivoTrue(dto.getClienteId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Cliente no encontrado con id: " + dto.getClienteId()));

        BigDecimal total = dto.getPeso().multiply(dto.getPrecioPorKg());

        VentaPanRallado venta = VentaPanRallado.builder()
                .fecha(dto.getFecha() != null ? dto.getFecha() : LocalDate.now())
                .cliente(cliente)
                .peso(dto.getPeso())
                .precioPorKg(dto.getPrecioPorKg())
                .total(total)
                .pagado(dto.getPagado())
                .montoPagado(dto.getPagado() ? total : BigDecimal.ZERO)
                .build();

        if (!dto.getPagado()) {
            cliente.setSaldo(cliente.getSaldo().subtract(total));
            clienteRepository.save(cliente);
        }

        return toResponseDTO(ventaRalladoRepository.save(venta));
    }

    @Transactional(readOnly = true)
    public List<VentaRalladoResponseDTO> listar() {
        return ventaRalladoRepository.findAllByOrderByFechaDesc()
                .stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public VentaRalladoResponseDTO obtener(Long id) {
        return toResponseDTO(findById(id));
    }

    @Transactional(readOnly = true)
    public List<VentaRalladoResponseDTO> listarImpagas() {
        return ventaRalladoRepository.findByPagadoFalseOrderByFechaDesc()
                .stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<VentaRalladoResponseDTO> listarPorFecha(LocalDate fecha) {
        return ventaRalladoRepository.findByFechaOrderByFechaDesc(fecha)
                .stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    private VentaPanRallado findById(Long id) {
        return ventaRalladoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venta de rallado no encontrada con id: " + id));
    }

    private VentaRalladoResponseDTO toResponseDTO(VentaPanRallado v) {
        BigDecimal montoPagado = v.getMontoPagado() != null ? v.getMontoPagado() : BigDecimal.ZERO;
        String estadoPago;
        if (v.isPagado()) estadoPago = "PAGADO";
        else if (montoPagado.compareTo(BigDecimal.ZERO) > 0) estadoPago = "INCOMPLETO";
        else estadoPago = "IMPAGO";

        return VentaRalladoResponseDTO.builder()
                .id(v.getId())
                .fecha(v.getFecha())
                .clienteId(v.getCliente().getId())
                .clienteNombre(v.getCliente().getNombre() + " " + v.getCliente().getApellido())
                .peso(v.getPeso())
                .precioPorKg(v.getPrecioPorKg())
                .total(v.getTotal())
                .pagado(v.isPagado())
                .montoPagado(montoPagado)
                .estadoPago(estadoPago)
                .build();
    }
}
