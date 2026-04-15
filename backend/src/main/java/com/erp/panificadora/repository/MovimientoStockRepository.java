package com.erp.panificadora.repository;

import com.erp.panificadora.model.MovimientoStock;
import com.erp.panificadora.model.TipoMovimiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface MovimientoStockRepository extends JpaRepository<MovimientoStock, Long> {

    List<MovimientoStock> findByMercaderiaIdOrderByFechaDesc(Long mercaderiaId);

    boolean existsByMercaderiaId(Long mercaderiaId);

    List<MovimientoStock> findAllByOrderByFechaDesc();

    @Query("SELECT COALESCE(SUM(m.cantidad), 0) FROM MovimientoStock m " +
           "WHERE m.mercaderia.id = :mercaderiaId AND m.tipo = :tipo")
    BigDecimal sumCantidadByMercaderiaIdAndTipo(
            @Param("mercaderiaId") Long mercaderiaId,
            @Param("tipo") TipoMovimiento tipo);
}
