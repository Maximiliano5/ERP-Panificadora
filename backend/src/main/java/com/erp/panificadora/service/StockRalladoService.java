package com.erp.panificadora.service;

import com.erp.panificadora.dto.MovimientoStockRalladoResponseDTO;
import com.erp.panificadora.dto.StockRalladoIngresoRequestDTO;
import com.erp.panificadora.model.MovimientoStockRallado;
import com.erp.panificadora.model.TipoMovimiento;
import com.erp.panificadora.repository.MovimientoStockRalladoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StockRalladoService {

    private final MovimientoStockRalladoRepository repository;

    @Transactional
    public MovimientoStockRalladoResponseDTO registrarIngreso(StockRalladoIngresoRequestDTO dto) {
        MovimientoStockRallado movimiento = MovimientoStockRallado.builder()
                .tipo(TipoMovimiento.INGRESO)
                .cantidadKg(dto.getCantidadKg())
                .fecha(dto.getFecha() != null ? dto.getFecha() : LocalDate.now())
                .observaciones(dto.getObservaciones())
                .build();

        return toResponseDTO(repository.save(movimiento));
    }

    @Transactional
    public void registrarEgresoPorVenta(Long ventaId, BigDecimal cantidadKg, LocalDate fecha) {
        MovimientoStockRallado movimiento = MovimientoStockRallado.builder()
                .tipo(TipoMovimiento.EGRESO)
                .cantidadKg(cantidadKg)
                .fecha(fecha)
                .observaciones("Venta de pan rallado")
                .ventaId(ventaId)
                .build();

        repository.save(movimiento);
    }

    @Transactional
    public void actualizarEgresoPorVenta(Long ventaId, BigDecimal cantidadKg, LocalDate fecha) {
        MovimientoStockRallado movimiento = repository.findByVentaId(ventaId)
                .orElseGet(() -> MovimientoStockRallado.builder()
                        .tipo(TipoMovimiento.EGRESO)
                        .ventaId(ventaId)
                        .observaciones("Venta de pan rallado")
                        .build());

        movimiento.setCantidadKg(cantidadKg);
        movimiento.setFecha(fecha);
        repository.save(movimiento);
    }

    @Transactional
    public void eliminarEgresoPorVenta(Long ventaId) {
        repository.deleteByVentaId(ventaId);
    }

    @Transactional(readOnly = true)
    public BigDecimal obtenerStockActual() {
        return repository.calcularStockActual();
    }

    @Transactional(readOnly = true)
    public List<MovimientoStockRalladoResponseDTO> listarMovimientos() {
        return repository.findAllByOrderByFechaDescIdDesc()
                .stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    private MovimientoStockRalladoResponseDTO toResponseDTO(MovimientoStockRallado m) {
        return MovimientoStockRalladoResponseDTO.builder()
                .id(m.getId())
                .tipo(m.getTipo())
                .cantidadKg(m.getCantidadKg())
                .fecha(m.getFecha())
                .observaciones(m.getObservaciones())
                .build();
    }
}
