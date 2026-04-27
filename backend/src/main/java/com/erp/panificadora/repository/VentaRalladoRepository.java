package com.erp.panificadora.repository;

import com.erp.panificadora.model.VentaPanRallado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface VentaRalladoRepository extends JpaRepository<VentaPanRallado, Long> {

    List<VentaPanRallado> findAllByOrderByFechaDesc();

    List<VentaPanRallado> findByPagadoFalseOrderByFechaDesc();

    List<VentaPanRallado> findByFechaOrderByFechaDesc(LocalDate fecha);

    List<VentaPanRallado> findByClienteIdOrderByFechaDesc(Long clienteId);

    List<VentaPanRallado> findByClienteIdAndFechaBetweenOrderByFechaDesc(Long clienteId, LocalDate desde, LocalDate hasta);
}
