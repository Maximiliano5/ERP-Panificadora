package com.erp.panificadora.service;

import com.erp.panificadora.dto.*;
import com.erp.panificadora.exception.ResourceNotFoundException;
import com.erp.panificadora.model.Cliente;
import com.erp.panificadora.model.PagoCliente;
import com.erp.panificadora.model.TipoPago;
import com.erp.panificadora.model.VentaMiga;
import com.erp.panificadora.model.VentaPanRallado;
import com.erp.panificadora.repository.ClienteRepository;
import com.erp.panificadora.repository.PagoClienteRepository;
import com.erp.panificadora.repository.VentaMigaRepository;
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
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final VentaMigaRepository ventaMigaRepository;
    private final VentaRalladoRepository ventaRalladoRepository;
    private final PagoClienteRepository pagoClienteRepository;

    @Transactional
    public ClienteResponseDTO crear(ClienteRequestDTO dto) {
        Cliente cliente = Cliente.builder()
                .nombre(dto.getNombre())
                .apellido(dto.getApellido())
                .tipo(dto.getTipo())
                .direccion(dto.getDireccion())
                .precioMiga(dto.getPrecioMiga())
                .precioRallado(dto.getPrecioRallado())
                .build();
        return toResponseDTO(clienteRepository.save(cliente));
    }

    @Transactional
    public ClienteResponseDTO actualizar(Long id, ClienteRequestDTO dto) {
        Cliente cliente = findActivo(id);
        cliente.setNombre(dto.getNombre());
        cliente.setApellido(dto.getApellido());
        cliente.setTipo(dto.getTipo());
        cliente.setDireccion(dto.getDireccion());
        cliente.setPrecioMiga(dto.getPrecioMiga());
        cliente.setPrecioRallado(dto.getPrecioRallado());
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

    @Transactional(readOnly = true)
    public ClientePerfilResponseDTO obtenerPerfil(Long id, LocalDate desde, LocalDate hasta) {
        Cliente cliente = findActivo(id);

        List<VentaMiga> ventasMiga = (desde != null && hasta != null)
                ? ventaMigaRepository.findByClienteIdAndFechaBetweenOrderByFechaDesc(id, desde, hasta)
                : ventaMigaRepository.findByClienteIdOrderByFechaDesc(id);

        List<VentaPanRallado> ventasRallado = (desde != null && hasta != null)
                ? ventaRalladoRepository.findByClienteIdAndFechaBetweenOrderByFechaDesc(id, desde, hasta)
                : ventaRalladoRepository.findByClienteIdOrderByFechaDesc(id);

        BigDecimal totalPanesMiga = ventasMiga.stream()
                .map(VentaMiga::getCantidad).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalKgRallado = ventasRallado.stream()
                .map(VentaPanRallado::getPeso).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalFacturadoMiga = ventasMiga.stream()
                .map(VentaMiga::getTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalFacturadoRallado = ventasRallado.stream()
                .map(VentaPanRallado::getTotal).reduce(BigDecimal.ZERO, BigDecimal::add);

        List<PagoClienteResponseDTO> pagos = pagoClienteRepository
                .findByClienteIdOrderByFechaDesc(id)
                .stream().map(this::toPagoDTO).collect(Collectors.toList());

        return ClientePerfilResponseDTO.builder()
                .cliente(toResponseDTO(cliente))
                .totalPanesMiga(totalPanesMiga)
                .totalKgRallado(totalKgRallado)
                .totalFacturadoMiga(totalFacturadoMiga)
                .totalFacturadoRallado(totalFacturadoRallado)
                .ventasMiga(ventasMiga.stream().map(this::toVentaMigaDTO).collect(Collectors.toList()))
                .ventasRallado(ventasRallado.stream().map(this::toVentaRalladoDTO).collect(Collectors.toList()))
                .pagos(pagos)
                .build();
    }

    @Transactional
    public PagoClienteResponseDTO registrarPago(Long clienteId, PagoClienteRequestDTO dto) {
        Cliente cliente = findActivo(clienteId);

        PagoCliente pago = PagoCliente.builder()
                .cliente(cliente)
                .fecha(dto.getFecha() != null ? dto.getFecha() : LocalDate.now())
                .monto(dto.getMonto())
                .descripcion(dto.getDescripcion())
                .tipoPago(dto.getTipoPago())
                .build();

        cliente.setSaldo(cliente.getSaldo().add(dto.getMonto()));
        clienteRepository.save(cliente);

        liquidarDeudaFIFO(clienteId, dto.getMonto(), dto.getTipoPago());

        return toPagoDTO(pagoClienteRepository.save(pago));
    }

    private void liquidarDeudaFIFO(Long clienteId, BigDecimal montoPago, TipoPago tipo) {
        BigDecimal restante = montoPago;
        if (tipo == TipoPago.MIGA) {
            for (VentaMiga m : ventaMigaRepository.findByClienteIdAndPagadoFalseOrderByFechaAscIdAsc(clienteId)) {
                if (restante.compareTo(BigDecimal.ZERO) <= 0) break;
                BigDecimal mp = m.getMontoPagado() != null ? m.getMontoPagado() : BigDecimal.ZERO;
                BigDecimal deuda = m.getTotal().subtract(mp);
                if (restante.compareTo(deuda) >= 0) {
                    restante = restante.subtract(deuda);
                    m.setPagado(true);
                    m.setMontoPagado(m.getTotal());
                } else {
                    m.setMontoPagado(mp.add(restante));
                    restante = BigDecimal.ZERO;
                }
                ventaMigaRepository.save(m);
            }
        } else {
            for (VentaPanRallado r : ventaRalladoRepository.findByClienteIdAndPagadoFalseOrderByFechaAscIdAsc(clienteId)) {
                if (restante.compareTo(BigDecimal.ZERO) <= 0) break;
                BigDecimal mp = r.getMontoPagado() != null ? r.getMontoPagado() : BigDecimal.ZERO;
                BigDecimal deuda = r.getTotal().subtract(mp);
                if (restante.compareTo(deuda) >= 0) {
                    restante = restante.subtract(deuda);
                    r.setPagado(true);
                    r.setMontoPagado(r.getTotal());
                } else {
                    r.setMontoPagado(mp.add(restante));
                    restante = BigDecimal.ZERO;
                }
                ventaRalladoRepository.save(r);
            }
        }
    }

    @Transactional(readOnly = true)
    public List<PagoClienteResponseDTO> listarPagos(Long clienteId) {
        findActivo(clienteId);
        return pagoClienteRepository.findByClienteIdOrderByFechaDesc(clienteId)
                .stream().map(this::toPagoDTO).collect(Collectors.toList());
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
                .direccion(c.getDireccion())
                .precioMiga(c.getPrecioMiga())
                .precioRallado(c.getPrecioRallado())
                .saldo(c.getSaldo())
                .build();
    }

    private VentaMigaResponseDTO toVentaMigaDTO(VentaMiga v) {
        BigDecimal mp = v.getMontoPagado() != null ? v.getMontoPagado() : BigDecimal.ZERO;
        String ep = v.isPagado() ? "PAGADO" : mp.compareTo(BigDecimal.ZERO) > 0 ? "INCOMPLETO" : "IMPAGO";
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
                .montoPagado(mp)
                .estadoPago(ep)
                .build();
    }

    private PagoClienteResponseDTO toPagoDTO(PagoCliente p) {
        return PagoClienteResponseDTO.builder()
                .id(p.getId())
                .clienteId(p.getCliente().getId())
                .fecha(p.getFecha())
                .monto(p.getMonto())
                .descripcion(p.getDescripcion())
                .tipoPago(p.getTipoPago() != null ? p.getTipoPago().name() : null)
                .build();
    }

    private VentaRalladoResponseDTO toVentaRalladoDTO(VentaPanRallado v) {
        BigDecimal mp = v.getMontoPagado() != null ? v.getMontoPagado() : BigDecimal.ZERO;
        String ep = v.isPagado() ? "PAGADO" : mp.compareTo(BigDecimal.ZERO) > 0 ? "INCOMPLETO" : "IMPAGO";
        return VentaRalladoResponseDTO.builder()
                .id(v.getId())
                .fecha(v.getFecha())
                .clienteId(v.getCliente().getId())
                .clienteNombre(v.getCliente().getNombre() + " " + v.getCliente().getApellido())
                .peso(v.getPeso())
                .precioPorKg(v.getPrecioPorKg())
                .total(v.getTotal())
                .pagado(v.isPagado())
                .montoPagado(mp)
                .estadoPago(ep)
                .build();
    }
}
