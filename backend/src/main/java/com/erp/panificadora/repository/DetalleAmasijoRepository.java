package com.erp.panificadora.repository;

import com.erp.panificadora.dto.ConsumoDiarioResponseDTO;
import com.erp.panificadora.dto.ConsumoMercaderiaResponseDTO;
import com.erp.panificadora.model.DetalleAmasijo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DetalleAmasijoRepository extends JpaRepository<DetalleAmasijo, Long> {

    @Query("SELECT new com.erp.panificadora.dto.ConsumoDiarioResponseDTO(" +
           "d.mercaderia.id, d.mercaderia.nombre, SUM(d.cantidadUtilizada)) " +
           "FROM DetalleAmasijo d WHERE d.amasijo.produccion.fecha = :fecha " +
           "GROUP BY d.mercaderia.id, d.mercaderia.nombre " +
           "ORDER BY d.mercaderia.nombre")
    List<ConsumoDiarioResponseDTO> findConsumoDiarioByFecha(@Param("fecha") LocalDate fecha);

    @Query("SELECT new com.erp.panificadora.dto.ConsumoMercaderiaResponseDTO(" +
           "d.amasijo.produccion.fecha, SUM(d.cantidadUtilizada)) " +
           "FROM DetalleAmasijo d WHERE d.mercaderia.id = :mercaderiaId " +
           "GROUP BY d.amasijo.produccion.fecha " +
           "ORDER BY d.amasijo.produccion.fecha DESC")
    List<ConsumoMercaderiaResponseDTO> findConsumoByMercaderiaId(@Param("mercaderiaId") Long mercaderiaId);
}
