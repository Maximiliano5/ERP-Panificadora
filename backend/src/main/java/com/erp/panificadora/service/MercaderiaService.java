package com.erp.panificadora.service;

import com.erp.panificadora.dto.MercaderiaRequestDTO;
import com.erp.panificadora.dto.MercaderiaResponseDTO;
import com.erp.panificadora.dto.ValorStockResponseDTO;
import com.erp.panificadora.exception.ResourceNotFoundException;
import com.erp.panificadora.model.Mercaderia;
import com.erp.panificadora.model.TipoMovimiento;
import com.erp.panificadora.repository.MercaderiaRepository;
import com.erp.panificadora.repository.MovimientoStockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MercaderiaService {

    private final MercaderiaRepository mercaderiaRepository;
    private final MovimientoStockRepository movimientoStockRepository;

    @Transactional
    public MercaderiaResponseDTO crear(MercaderiaRequestDTO dto) {
        Mercaderia mercaderia = Mercaderia.builder()
                .nombre(dto.getNombre())
                .precioUnitario(dto.getPrecioUnitario())
                .build();
        return toResponseDTO(mercaderiaRepository.save(mercaderia));
    }

    @Transactional
    public MercaderiaResponseDTO actualizar(Long id, MercaderiaRequestDTO dto) {
        Mercaderia mercaderia = findEntityById(id);
        mercaderia.setNombre(dto.getNombre());
        mercaderia.setPrecioUnitario(dto.getPrecioUnitario());
        return toResponseDTO(mercaderiaRepository.save(mercaderia));
    }

    @Transactional
    public void eliminar(Long id) {
        findEntityById(id);
        mercaderiaRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<MercaderiaResponseDTO> listar(String nombre) {
        List<Mercaderia> mercaderias = (nombre != null && !nombre.isBlank())
                ? mercaderiaRepository.findByNombreContainingIgnoreCase(nombre)
                : mercaderiaRepository.findAll();
        return mercaderias.stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MercaderiaResponseDTO obtener(Long id) {
        return toResponseDTO(findEntityById(id));
    }

    @Transactional(readOnly = true)
    public ValorStockResponseDTO calcularValorTotal(String nombre) {
        List<MercaderiaResponseDTO> mercaderias = listar(nombre);
        BigDecimal valorTotal = mercaderias.stream()
                .map(MercaderiaResponseDTO::getValorTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return ValorStockResponseDTO.builder()
                .mercaderias(mercaderias)
                .valorTotal(valorTotal)
                .build();
    }

    public BigDecimal calcularStock(Long mercaderiaId) {
        BigDecimal ingresos = movimientoStockRepository
                .sumCantidadByMercaderiaIdAndTipo(mercaderiaId, TipoMovimiento.INGRESO);
        BigDecimal egresos = movimientoStockRepository
                .sumCantidadByMercaderiaIdAndTipo(mercaderiaId, TipoMovimiento.EGRESO);
        return ingresos.subtract(egresos);
    }

    private Mercaderia findEntityById(Long id) {
        return mercaderiaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Mercadería no encontrada con id: " + id));
    }

    private MercaderiaResponseDTO toResponseDTO(Mercaderia m) {
        BigDecimal cantidadActual = calcularStock(m.getId());
        BigDecimal valorTotal = cantidadActual.multiply(m.getPrecioUnitario());
        return MercaderiaResponseDTO.builder()
                .id(m.getId())
                .nombre(m.getNombre())
                .precioUnitario(m.getPrecioUnitario())
                .cantidadActual(cantidadActual)
                .valorTotal(valorTotal)
                .build();
    }
}
