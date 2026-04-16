package com.erp.panificadora.service;

import com.erp.panificadora.dto.*;
import com.erp.panificadora.exception.ResourceNotFoundException;
import com.erp.panificadora.model.Amasijo;
import com.erp.panificadora.model.DetalleAmasijo;
import com.erp.panificadora.model.Mercaderia;
import com.erp.panificadora.model.Produccion;
import com.erp.panificadora.repository.DetalleAmasijoRepository;
import com.erp.panificadora.repository.MercaderiaRepository;
import com.erp.panificadora.repository.ProduccionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProduccionService {

    private final ProduccionRepository produccionRepository;
    private final DetalleAmasijoRepository detalleAmasijoRepository;
    private final MercaderiaRepository mercaderiaRepository;
    private final MovimientoStockService movimientoStockService;

    @Transactional
    public ProduccionResponseDTO crear(ProduccionRequestDTO dto) {
        Produccion produccion = Produccion.builder()
                .fecha(dto.getFecha())
                .observaciones(dto.getObservaciones())
                .amasijos(new ArrayList<>())
                .build();

        for (AmasijoRequestDTO amasijoReq : dto.getAmasijos()) {
            Amasijo amasijo = Amasijo.builder()
                    .produccion(produccion)
                    .cantidadPanProducido(amasijoReq.getCantidadPanProducido())
                    .detalles(new ArrayList<>())
                    .build();

            for (DetalleAmasijoRequestDTO detalleReq : amasijoReq.getInsumos()) {
                Mercaderia mercaderia = mercaderiaRepository.findByIdAndActivoTrue(detalleReq.getMercaderiaId())
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Mercadería no encontrada con id: " + detalleReq.getMercaderiaId()));

                // Genera el EGRESO en MovimientoStock. La validación de stock se centraliza aquí.
                movimientoStockService.registrarEgresoProduccion(
                        mercaderia,
                        detalleReq.getCantidad(),
                        dto.getFecha().atStartOfDay()
                );

                DetalleAmasijo detalle = DetalleAmasijo.builder()
                        .amasijo(amasijo)
                        .mercaderia(mercaderia)
                        .cantidadUtilizada(detalleReq.getCantidad())
                        .build();

                amasijo.getDetalles().add(detalle);
            }

            produccion.getAmasijos().add(amasijo);
        }

        return toResponseDTO(produccionRepository.save(produccion));
    }

    @Transactional(readOnly = true)
    public List<ProduccionResponseDTO> listar() {
        return produccionRepository.findAllByOrderByFechaDesc().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProduccionResponseDTO obtener(Long id) {
        Produccion produccion = produccionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producción no encontrada con id: " + id));
        return toResponseDTO(produccion);
    }

    @Transactional(readOnly = true)
    public List<ConsumoDiarioResponseDTO> consumoDiario(java.time.LocalDate fecha) {
        return detalleAmasijoRepository.findConsumoDiarioByFecha(fecha);
    }

    @Transactional(readOnly = true)
    public List<ConsumoMercaderiaResponseDTO> consumoPorMercaderia(Long mercaderiaId) {
        if (!mercaderiaRepository.existsById(mercaderiaId)) {
            throw new ResourceNotFoundException("Mercadería no encontrada con id: " + mercaderiaId);
        }
        return detalleAmasijoRepository.findConsumoByMercaderiaId(mercaderiaId);
    }

    private ProduccionResponseDTO toResponseDTO(Produccion p) {
        List<AmasijoResponseDTO> amasijosDto = p.getAmasijos().stream()
                .map(a -> AmasijoResponseDTO.builder()
                        .id(a.getId())
                        .cantidadPanProducido(a.getCantidadPanProducido())
                        .insumos(a.getDetalles().stream()
                                .map(d -> DetalleAmasijoResponseDTO.builder()
                                        .id(d.getId())
                                        .mercaderiaId(d.getMercaderia().getId())
                                        .mercaderiaNombre(d.getMercaderia().getNombre())
                                        .cantidadUtilizada(d.getCantidadUtilizada())
                                        .build())
                                .collect(Collectors.toList()))
                        .build())
                .collect(Collectors.toList());

        return ProduccionResponseDTO.builder()
                .id(p.getId())
                .fecha(p.getFecha())
                .observaciones(p.getObservaciones())
                .amasijos(amasijosDto)
                .build();
    }
}
