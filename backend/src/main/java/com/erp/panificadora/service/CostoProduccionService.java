package com.erp.panificadora.service;

import com.erp.panificadora.dto.*;
import com.erp.panificadora.exception.ResourceNotFoundException;
import com.erp.panificadora.model.*;
import com.erp.panificadora.repository.CostoProduccionRepository;
import com.erp.panificadora.repository.MercaderiaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CostoProduccionService {

    private final CostoProduccionRepository costoProduccionRepository;
    private final MercaderiaRepository mercaderiaRepository;

    @Transactional
    public CostoProduccionResponseDTO crear(CostoProduccionRequestDTO dto) {
        // 1. Calcular costo de insumos
        List<DetalleCostoInsumo> detalles = new ArrayList<>();
        BigDecimal totalInsumos = BigDecimal.ZERO;

        for (DetalleCostoInsumoRequestDTO insumoDto : dto.getInsumos()) {
            Mercaderia mercaderia = mercaderiaRepository.findByIdAndActivoTrue(insumoDto.getMercaderiaId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Mercadería no encontrada con id: " + insumoDto.getMercaderiaId()));

            BigDecimal costoCalculado = mercaderia.getPrecioUnitario()
                    .multiply(BigDecimal.valueOf(insumoDto.getCantidad()))
                    .multiply(insumoDto.getPorcentajeUso())
                    .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);

            totalInsumos = totalInsumos.add(costoCalculado);

            detalles.add(DetalleCostoInsumo.builder()
                    .mercaderia(mercaderia)
                    .cantidad(insumoDto.getCantidad())
                    .porcentajeUso(insumoDto.getPorcentajeUso())
                    .costoCalculado(costoCalculado)
                    .build());
        }

        // 2. Calcular costos fijos
        CostosFijosRequestDTO cf = dto.getCostosFijos();
        BigDecimal totalCostosFijos = cf.getCostoAmasado()
                .add(cf.getCostoCoccion())
                .add(cf.getCostoCorte())
                .add(cf.getCostoDistribucion())
                .add(cf.getCostoElectricidad())
                .add(cf.getCostoAgua())
                .add(cf.getCostoGas());

        if (cf.getCostosAdicionales() != null) {
            for (CostoAdicionalDTO adicional : cf.getCostosAdicionales()) {
                totalCostosFijos = totalCostosFijos.add(adicional.getMonto());
            }
        }

        // 3. Calcular costo de bolsas (cada unidad usa 2 bolsas porque el pan se divide en mitades)
        BigDecimal costoTotalBolsas = dto.getCostoBolsasUnitario()
                .multiply(BigDecimal.valueOf(dto.getCantidadUnidadesProducidas()))
                .multiply(BigDecimal.valueOf(2));

        // 4. Total y costo unitario
        BigDecimal costoTotal = totalInsumos.add(totalCostosFijos).add(costoTotalBolsas);
        BigDecimal costoUnitario = costoTotal.divide(
                BigDecimal.valueOf(dto.getCantidadUnidadesProducidas()), 4, RoundingMode.HALF_UP);

        // 5. Construir y persistir entidad
        CostosFijosBase costosFijosBase = CostosFijosBase.builder()
                .costoAmasado(cf.getCostoAmasado())
                .costoCoccion(cf.getCostoCoccion())
                .costoCorte(cf.getCostoCorte())
                .costoDistribucion(cf.getCostoDistribucion())
                .costoElectricidad(cf.getCostoElectricidad())
                .costoAgua(cf.getCostoAgua())
                .costoGas(cf.getCostoGas())
                .build();

        List<CostoAdicional> costosAdicionalesEntidad = new ArrayList<>();
        if (cf.getCostosAdicionales() != null) {
            for (CostoAdicionalDTO ad : cf.getCostosAdicionales()) {
                costosAdicionalesEntidad.add(new CostoAdicional(ad.getNombre(), ad.getMonto()));
            }
        }

        CostoProduccion costo = CostoProduccion.builder()
                .fecha(LocalDate.now())
                .nombre(dto.getNombre())
                .cantidadUnidadesProducidas(dto.getCantidadUnidadesProducidas())
                .costoBolsasUnitario(dto.getCostoBolsasUnitario())
                .costoTotal(costoTotal)
                .costoUnitario(costoUnitario)
                .totalInsumos(totalInsumos)
                .totalCostosFijos(totalCostosFijos)
                .costoTotalBolsas(costoTotalBolsas)
                .costosFijos(costosFijosBase)
                .costosAdicionales(costosAdicionalesEntidad)
                .build();

        for (DetalleCostoInsumo detalle : detalles) {
            detalle.setCostoProduccion(costo);
            costo.getDetalles().add(detalle);
        }

        return toResponseDTO(costoProduccionRepository.save(costo));
    }

    @Transactional(readOnly = true)
    public List<CostoProduccionResponseDTO> listar() {
        return costoProduccionRepository.findAllByOrderByFechaDesc()
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CostoProduccionResponseDTO obtener(Long id) {
        CostoProduccion costo = costoProduccionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Costo de producción no encontrado con id: " + id));
        return toResponseDTO(costo);
    }

    private CostoProduccionResponseDTO toResponseDTO(CostoProduccion c) {
        List<DetalleCostoInsumoResponseDTO> insumosDTO = c.getDetalles().stream()
                .map(d -> DetalleCostoInsumoResponseDTO.builder()
                        .id(d.getId())
                        .mercaderiaId(d.getMercaderia().getId())
                        .mercaderiaNombre(d.getMercaderia().getNombre())
                        .cantidad(d.getCantidad())
                        .porcentajeUso(d.getPorcentajeUso())
                        .costoCalculado(d.getCostoCalculado())
                        .precioUnitarioMercaderia(d.getMercaderia().getPrecioUnitario())
                        .build())
                .collect(Collectors.toList());

        List<CostoAdicionalDTO> adicionalesDTO = c.getCostosAdicionales().stream()
                .map(a -> new CostoAdicionalDTO(a.getNombre(), a.getMonto()))
                .collect(Collectors.toList());

        CostosFijosBase cf = c.getCostosFijos();
        CostosFijosResponseDTO costosFijosDTO = CostosFijosResponseDTO.builder()
                .costoAmasado(cf.getCostoAmasado())
                .costoCoccion(cf.getCostoCoccion())
                .costoCorte(cf.getCostoCorte())
                .costoDistribucion(cf.getCostoDistribucion())
                .costoElectricidad(cf.getCostoElectricidad())
                .costoAgua(cf.getCostoAgua())
                .costoGas(cf.getCostoGas())
                .costosAdicionales(adicionalesDTO)
                .total(c.getTotalCostosFijos())
                .build();

        return CostoProduccionResponseDTO.builder()
                .id(c.getId())
                .fecha(c.getFecha())
                .nombre(c.getNombre())
                .cantidadUnidadesProducidas(c.getCantidadUnidadesProducidas())
                .costoBolsasUnitario(c.getCostoBolsasUnitario())
                .costoTotal(c.getCostoTotal())
                .costoUnitario(c.getCostoUnitario())
                .totalInsumos(c.getTotalInsumos())
                .totalCostosFijos(c.getTotalCostosFijos())
                .costoTotalBolsas(c.getCostoTotalBolsas())
                .insumos(insumosDTO)
                .costosFijos(costosFijosDTO)
                .build();
    }
}
