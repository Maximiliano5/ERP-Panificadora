package com.erp.panificadora.service;

import com.erp.panificadora.dto.VentaMigaRequestDTO;
import com.erp.panificadora.dto.VentaMigaResponseDTO;
import com.erp.panificadora.exception.ResourceNotFoundException;
import com.erp.panificadora.model.Cliente;
import com.erp.panificadora.model.TipoPan;
import com.erp.panificadora.model.UnidadMiga;
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
                .tipoPan(TipoPan.BLANCO)
                .cantidad(dto.getCantidad())
                .unidad(UnidadMiga.ENTERO)
                .precioUnitario(dto.getPrecioUnitario())
                .total(total)
                .pagado(dto.getPagado())
                .montoPagado(dto.getPagado() ? total : BigDecimal.ZERO)
                .build();

        if (!dto.getPagado()) {
            BigDecimal sm = cliente.getSaldoMiga() != null ? cliente.getSaldoMiga() : BigDecimal.ZERO;
            cliente.setSaldoMiga(sm.subtract(total));
            clienteRepository.save(cliente);
        }

        return toResponseDTO(ventaMigaRepository.save(venta));
    }

    @Transactional
    public VentaMigaResponseDTO actualizar(Long id, VentaMigaRequestDTO dto) {
        VentaMiga venta = findById(id);
        Cliente cliente = venta.getCliente();

        // Revertir efecto anterior en saldoMiga
        if (!venta.isPagado()) {
            BigDecimal mp = venta.getMontoPagado() != null ? venta.getMontoPagado() : BigDecimal.ZERO;
            BigDecimal deudaPendiente = venta.getTotal().subtract(mp);
            BigDecimal sm = cliente.getSaldoMiga() != null ? cliente.getSaldoMiga() : BigDecimal.ZERO;
            cliente.setSaldoMiga(sm.add(deudaPendiente));
        }

        // Calcular nuevo total
        BigDecimal nuevoTotal = dto.getCantidad().multiply(dto.getPrecioUnitario());

        // Aplicar nuevo efecto en saldoMiga
        if (!dto.getPagado()) {
            BigDecimal sm = cliente.getSaldoMiga() != null ? cliente.getSaldoMiga() : BigDecimal.ZERO;
            cliente.setSaldoMiga(sm.subtract(nuevoTotal));
        }
        clienteRepository.save(cliente);

        venta.setFecha(dto.getFecha() != null ? dto.getFecha() : venta.getFecha());
        venta.setCantidad(dto.getCantidad());
        venta.setPrecioUnitario(dto.getPrecioUnitario());
        venta.setTotal(nuevoTotal);
        venta.setPagado(dto.getPagado());
        venta.setMontoPagado(dto.getPagado() ? nuevoTotal : BigDecimal.ZERO);

        return toResponseDTO(ventaMigaRepository.save(venta));
    }

    @Transactional
    public void eliminar(Long id) {
        VentaMiga venta = findById(id);
        Cliente cliente = venta.getCliente();

        if (!venta.isPagado()) {
            BigDecimal mp = venta.getMontoPagado() != null ? venta.getMontoPagado() : BigDecimal.ZERO;
            BigDecimal deudaPendiente = venta.getTotal().subtract(mp);
            BigDecimal sm = cliente.getSaldoMiga() != null ? cliente.getSaldoMiga() : BigDecimal.ZERO;
            cliente.setSaldoMiga(sm.add(deudaPendiente));
            clienteRepository.save(cliente);
        }

        ventaMigaRepository.delete(venta);
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
                .cantidad(v.getCantidad())
                .precioUnitario(v.getPrecioUnitario())
                .total(v.getTotal())
                .pagado(v.isPagado())
                .montoPagado(montoPagado)
                .estadoPago(estadoPago)
                .build();
    }
}
