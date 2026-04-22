package com.erp.panificadora.repository;

import com.erp.panificadora.model.CostoProduccion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CostoProduccionRepository extends JpaRepository<CostoProduccion, Long> {
    List<CostoProduccion> findAllByOrderByFechaDesc();
}
