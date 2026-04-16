package com.erp.panificadora.repository;

import com.erp.panificadora.model.Produccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProduccionRepository extends JpaRepository<Produccion, Long> {

    List<Produccion> findAllByOrderByFechaDesc();

    Optional<Produccion> findFirstByFechaOrderByIdAsc(LocalDate fecha);
}
