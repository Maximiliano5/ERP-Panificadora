package com.erp.panificadora.repository;

import com.erp.panificadora.model.MovimientoStockRallado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface MovimientoStockRalladoRepository extends JpaRepository<MovimientoStockRallado, Long> {

    List<MovimientoStockRallado> findAllByOrderByFechaDescIdDesc();

    Optional<MovimientoStockRallado> findByVentaId(Long ventaId);

    void deleteByVentaId(Long ventaId);

    @Query("SELECT COALESCE(SUM(CASE WHEN m.tipo = com.erp.panificadora.model.TipoMovimiento.INGRESO " +
            "THEN m.cantidadKg ELSE -m.cantidadKg END), 0) FROM MovimientoStockRallado m")
    BigDecimal calcularStockActual();
}
