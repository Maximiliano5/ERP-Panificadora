package com.erp.panificadora.service;

import com.erp.panificadora.dto.MovimientoStockRequestDTO;
import com.erp.panificadora.dto.MovimientoStockResponseDTO;
import com.erp.panificadora.exception.ResourceNotFoundException;
import com.erp.panificadora.exception.StockInsuficienteException;
import com.erp.panificadora.model.Mercaderia;
import com.erp.panificadora.model.MovimientoStock;
import com.erp.panificadora.model.TipoMovimiento;
import com.erp.panificadora.repository.MercaderiaRepository;
import com.erp.panificadora.repository.MovimientoStockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MovimientoStockService {

    private final MovimientoStockRepository movimientoStockRepository;
    private final MercaderiaRepository mercaderiaRepository;
    private final MercaderiaService mercaderiaService;

    @Transactional
    public MovimientoStockResponseDTO registrar(MovimientoStockRequestDTO dto) {
        Mercaderia mercaderia = mercaderiaRepository.findById(dto.getMercaderiaId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Mercadería no encontrada con id: " + dto.getMercaderiaId()));

        if (dto.getTipo() == TipoMovimiento.EGRESO) {
            BigDecimal stockActual = mercaderiaService.calcularStock(mercaderia.getId());
            if (stockActual.compareTo(dto.getCantidad()) < 0) {
                throw new StockInsuficienteException(
                        "Stock insuficiente para '" + mercaderia.getNombre() +
                        "'. Stock actual: " + stockActual.stripTrailingZeros().toPlainString() +
                        ", cantidad solicitada: " + dto.getCantidad().stripTrailingZeros().toPlainString());
            }
        }

        MovimientoStock movimiento = MovimientoStock.builder()
                .tipo(dto.getTipo())
                .mercaderia(mercaderia)
                .cantidad(dto.getCantidad())
                .fecha(LocalDateTime.now())
                .observaciones(dto.getObservaciones())
                .proveedor(dto.getProveedor())
                .receptor(dto.getReceptor())
                .motivo(dto.getMotivo())
                .build();

        return toResponseDTO(movimientoStockRepository.save(movimiento));
    }

    @Transactional(readOnly = true)
    public List<MovimientoStockResponseDTO> listar() {
        return movimientoStockRepository.findAllByOrderByFechaDesc()
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MovimientoStockResponseDTO> listarPorMercaderia(Long mercaderiaId) {
        if (!mercaderiaRepository.existsById(mercaderiaId)) {
            throw new ResourceNotFoundException("Mercadería no encontrada con id: " + mercaderiaId);
        }
        return movimientoStockRepository.findByMercaderiaIdOrderByFechaDesc(mercaderiaId)
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Registra un EGRESO generado por el módulo de Producción.
     * Centraliza la validación de stock y la creación del movimiento,
     * manteniendo la auditoría consistente con el resto del sistema.
     */
    @Transactional
    public void registrarEgresoProduccion(Mercaderia mercaderia, BigDecimal cantidad, LocalDateTime fecha) {
        BigDecimal stockActual = mercaderiaService.calcularStock(mercaderia.getId());
        if (stockActual.compareTo(cantidad) < 0) {
            throw new StockInsuficienteException(
                    "Stock insuficiente para '" + mercaderia.getNombre() +
                    "'. Stock actual: " + stockActual.stripTrailingZeros().toPlainString() +
                    ", cantidad solicitada: " + cantidad.stripTrailingZeros().toPlainString());
        }

        MovimientoStock movimiento = MovimientoStock.builder()
                .tipo(TipoMovimiento.EGRESO)
                .mercaderia(mercaderia)
                .cantidad(cantidad)
                .fecha(fecha)
                .motivo("Producción - Amasijo")
                .build();

        movimientoStockRepository.save(movimiento);
    }

    private MovimientoStockResponseDTO toResponseDTO(MovimientoStock m) {
        return MovimientoStockResponseDTO.builder()
                .id(m.getId())
                .tipo(m.getTipo())
                .mercaderiaId(m.getMercaderia().getId())
                .mercaderiaNombre(m.getMercaderia().getNombre())
                .cantidad(m.getCantidad())
                .fecha(m.getFecha())
                .observaciones(m.getObservaciones())
                .proveedor(m.getProveedor())
                .receptor(m.getReceptor())
                .motivo(m.getMotivo())
                .build();
    }
}
