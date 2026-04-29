package com.erp.panificadora.repository;

import com.erp.panificadora.model.VentaMiga;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface VentaMigaRepository extends JpaRepository<VentaMiga, Long> {

    List<VentaMiga> findAllByOrderByFechaDesc();

    List<VentaMiga> findByPagadoFalseOrderByFechaDesc();

    List<VentaMiga> findByFechaOrderByFechaDesc(LocalDate fecha);

    List<VentaMiga> findByClienteIdOrderByFechaDesc(Long clienteId);

    List<VentaMiga> findByClienteIdAndFechaBetweenOrderByFechaDesc(Long clienteId, LocalDate desde, LocalDate hasta);

    List<VentaMiga> findByClienteIdAndPagadoFalseOrderByFechaAscIdAsc(Long clienteId);
}
