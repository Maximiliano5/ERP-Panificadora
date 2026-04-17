package com.erp.panificadora.service;

import com.erp.panificadora.dto.AmasijoRequestDTO;
import com.erp.panificadora.dto.AmasijoResponseDTO;
import com.erp.panificadora.dto.DetalleAmasijoRequestDTO;
import com.erp.panificadora.dto.DetalleAmasijoResponseDTO;
import com.erp.panificadora.exception.ResourceNotFoundException;
import com.erp.panificadora.model.Amasijo;
import com.erp.panificadora.model.DetalleAmasijo;
import com.erp.panificadora.model.Mercaderia;
import com.erp.panificadora.model.Produccion;
import com.erp.panificadora.repository.AmasijoRepository;
import com.erp.panificadora.repository.MercaderiaRepository;
import com.erp.panificadora.repository.ProduccionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AmasijoService {

    private final AmasijoRepository amasijoRepository;
    private final MercaderiaRepository mercaderiaRepository;
    private final MovimientoStockService movimientoStockService;
    private final ProduccionRepository produccionRepository;

    @Transactional
    public void eliminar(Long id) {
        Amasijo amasijo = amasijoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Amasijo no encontrado con id: " + id));

        Produccion produccion = amasijo.getProduccion();
        LocalDateTime fecha = produccion.getFecha().atStartOfDay();
        boolean esElUltimo = produccion.getAmasijos().size() == 1;

        // Revertir los egresos de cada insumo creando ingresos compensatorios
        for (DetalleAmasijo detalle : amasijo.getDetalles()) {
            movimientoStockService.registrarIngresoAnulacion(
                    detalle.getMercaderia(),
                    detalle.getCantidadUtilizada(),
                    fecha
            );
        }

        amasijoRepository.delete(amasijo);

        // Si era el último amasijo, eliminar la producción también
        if (esElUltimo) {
            produccionRepository.delete(produccion);
        }
    }

    @Transactional
    public AmasijoResponseDTO actualizar(Long id, AmasijoRequestDTO dto) {
        Amasijo amasijo = amasijoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Amasijo no encontrado con id: " + id));

        LocalDateTime fecha = amasijo.getProduccion().getFecha().atStartOfDay();

        // 1. Revertir todos los egresos actuales
        for (DetalleAmasijo detalle : amasijo.getDetalles()) {
            movimientoStockService.registrarIngresoAnulacion(
                    detalle.getMercaderia(),
                    detalle.getCantidadUtilizada(),
                    fecha
            );
        }

        // 2. Limpiar los detalles existentes (orphanRemoval los elimina de la BD)
        amasijo.getDetalles().clear();
        amasijo.setCantidadPanProducido(dto.getCantidadPanProducido());

        // 3. Crear nuevos detalles y registrar los nuevos egresos
        for (DetalleAmasijoRequestDTO detalleReq : dto.getInsumos()) {
            Mercaderia mercaderia = mercaderiaRepository.findByIdAndActivoTrue(detalleReq.getMercaderiaId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Mercadería no encontrada con id: " + detalleReq.getMercaderiaId()));

            movimientoStockService.registrarEgresoProduccion(
                    mercaderia,
                    detalleReq.getCantidad(),
                    fecha
            );

            DetalleAmasijo detalle = DetalleAmasijo.builder()
                    .amasijo(amasijo)
                    .mercaderia(mercaderia)
                    .cantidadUtilizada(detalleReq.getCantidad())
                    .build();

            amasijo.getDetalles().add(detalle);
        }

        return toResponseDTO(amasijoRepository.save(amasijo));
    }

    private AmasijoResponseDTO toResponseDTO(Amasijo a) {
        return AmasijoResponseDTO.builder()
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
                .build();
    }
}
