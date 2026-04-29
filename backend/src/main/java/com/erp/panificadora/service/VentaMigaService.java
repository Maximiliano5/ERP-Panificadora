package com.erp.panificadora.service;

import com.erp.panificadora.dto.VentaMigaRequestDTO;
import com.erp.panificadora.dto.VentaMigaResponseDTO;
import com.erp.panificadora.exception.ResourceNotFoundException;
import com.erp.panificadora.model.Cliente;
import com.erp.panificadora.model.VentaMiga;
import com.erp.panificadora.repository.ClienteRepository;
import com.erp.panificadora.repository.VentaMigaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VentaMigaService {

    private final VentaMigaRepository ventaMigaRepository;
    private final ClienteRepository clienteRepository;

    @Transactional
    public VentaMigaResponseDTO registrar(VentaMigaRequestDTO dto) {
        Cliente cliente = clienteRepository.findByIdAndActivoTrue(dto.getClienteId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Cliente no encontrado con id: " + dto.getClienteId()));

        BigDecimal total = dto.getCantidad().multiply(dto.getPrecioUnitario());

        VentaMiga venta = VentaMiga.builder()
                .fecha(dto.getFecha() != null ? dto.getFecha() : LocalDate.now())
                .cliente(cliente)
                .tipoPan(dto.getTipoPan())
                .cantidad(dto.getCantidad())
                .unidad(dto.getUnidad())
                .precioUnitario(dto.getPrecioUnitario())
                .total(total)
                .pagado(dto.getPagado())
                .montoPagado(dto.getPagado() ? total : BigDecimal.ZERO)
                .build();

        if (!dto.getPagado()) {
            cliente.setSaldo(cliente.getSaldo().subtract(total));
            clienteRepository.save(cliente);
        }

        return toResponseDTO(ventaMigaRepository.save(venta));
    }

    @Transactional(readOnly = true)
    public List<VentaMigaResponseDTO> listar() {
        return ventaMigaRepository.findAllByOrderByFechaDesc()
                .stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public VentaMigaResponseDTO obtener(Long id) {
        return toResponseDTO(findById(id));
    }

    @Transactional(readOnly = true)
    public List<VentaMigaResponseDTO> listarImpagas() {
        return ventaMigaRepository.findByPagadoFalseOrderByFechaDesc()
                .stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<VentaMigaResponseDTO> listarPorFecha(LocalDate fecha) {
        return ventaMigaRepository.findByFechaOrderByFechaDesc(fecha)
                .stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    private VentaMiga findById(Long id) {
        return ventaMigaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venta de miga no encontrada con id: " + id));
    }

    private VentaMigaResponseDTO toResponseDTO(VentaMiga v) {
        BigDecimal montoPagado = v.getMontoPagado() != null ? v.getMontoPagado() : BigDecimal.ZERO;
        String estadoPago;
        if (v.isPagado()) estadoPago = "PAGADO";
        else if (montoPagado.compareTo(BigDecimal.ZERO) > 0) estadoPago = "INCOMPLETO";
        else estadoPago = "IMPAGO";

        return VentaMigaResponseDTO.builder()
                .id(v.getId())
                .fecha(v.getFecha())
                .clienteId(v.getCliente().getId())
                .clienteNombre(v.getCliente().getNombre() + " " + v.getCliente().getApellido())
                .tipoPan(v.getTipoPan().name())
                .cantidad(v.getCantidad())
                .unidad(v.getUnidad().name())
                .precioUnitario(v.getPrecioUnitario())
                .total(v.getTotal())
                .pagado(v.isPagado())
                .montoPagado(montoPagado)
                .estadoPago(estadoPago)
                .build();
    }
}
