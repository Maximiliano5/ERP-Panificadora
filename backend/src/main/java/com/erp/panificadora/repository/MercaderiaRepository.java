package com.erp.panificadora.repository;

import com.erp.panificadora.model.Mercaderia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MercaderiaRepository extends JpaRepository<Mercaderia, Long> {

    List<Mercaderia> findAllByActivoTrue();

    List<Mercaderia> findByNombreContainingIgnoreCaseAndActivoTrue(String nombre);

    Optional<Mercaderia> findByIdAndActivoTrue(Long id);
}
