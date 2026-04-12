package com.erp.panificadora.config;

import com.erp.panificadora.model.Mercaderia;
import com.erp.panificadora.model.MovimientoStock;
import com.erp.panificadora.model.TipoMovimiento;
import com.erp.panificadora.repository.MercaderiaRepository;
import com.erp.panificadora.repository.MovimientoStockRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final MercaderiaRepository mercaderiaRepository;
    private final MovimientoStockRepository movimientoStockRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (mercaderiaRepository.count() > 0) {
            log.info("Base de datos ya inicializada. Saltando seed data.");
            return;
        }

        log.info("Inicializando datos de ejemplo...");

        List<Mercaderia> mercaderias = mercaderiaRepository.saveAll(List.of(
            Mercaderia.builder().nombre("Harina 000").precioUnitario(new BigDecimal("850.00")).build(),
            Mercaderia.builder().nombre("Harina 0000").precioUnitario(new BigDecimal("920.00")).build(),
            Mercaderia.builder().nombre("Azúcar").precioUnitario(new BigDecimal("600.00")).build(),
            Mercaderia.builder().nombre("Sal").precioUnitario(new BigDecimal("150.00")).build(),
            Mercaderia.builder().nombre("Levadura Fresca").precioUnitario(new BigDecimal("450.00")).build(),
            Mercaderia.builder().nombre("Manteca").precioUnitario(new BigDecimal("1800.00")).build(),
            Mercaderia.builder().nombre("Aceite de Girasol").precioUnitario(new BigDecimal("1200.00")).build(),
            Mercaderia.builder().nombre("Huevos (docena)").precioUnitario(new BigDecimal("900.00")).build()
        ));

        int[] cantidades = {100, 50, 80, 30, 20, 40, 25, 15};
        for (int i = 0; i < mercaderias.size(); i++) {
            movimientoStockRepository.save(
                MovimientoStock.builder()
                    .tipo(TipoMovimiento.INGRESO)
                    .mercaderia(mercaderias.get(i))
                    .cantidad(new BigDecimal(cantidades[i]))
                    .fecha(LocalDateTime.now().minusDays(7))
                    .observaciones("Stock inicial")
                    .proveedor("Proveedor Principal")
                    .receptor("Admin")
                    .build()
            );
        }

        movimientoStockRepository.saveAll(List.of(
            MovimientoStock.builder()
                .tipo(TipoMovimiento.EGRESO)
                .mercaderia(mercaderias.get(0))
                .cantidad(new BigDecimal("20"))
                .fecha(LocalDateTime.now().minusDays(3))
                .observaciones("Producción de pan francés")
                .motivo("Producción")
                .build(),
            MovimientoStock.builder()
                .tipo(TipoMovimiento.EGRESO)
                .mercaderia(mercaderias.get(2))
                .cantidad(new BigDecimal("10"))
                .fecha(LocalDateTime.now().minusDays(2))
                .observaciones("Producción de facturas")
                .motivo("Producción")
                .build(),
            MovimientoStock.builder()
                .tipo(TipoMovimiento.INGRESO)
                .mercaderia(mercaderias.get(0))
                .cantidad(new BigDecimal("50"))
                .fecha(LocalDateTime.now().minusDays(1))
                .observaciones("Reposición semanal")
                .proveedor("Molinos Río de la Plata")
                .receptor("Juan García")
                .build()
        ));

        log.info("Datos de ejemplo cargados exitosamente.");
    }
}
