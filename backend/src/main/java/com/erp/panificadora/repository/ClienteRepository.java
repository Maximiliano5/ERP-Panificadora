package com.erp.panificadora.repository;

import com.erp.panificadora.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    List<Cliente> findAllByActivoTrue();

    Optional<Cliente> findByIdAndActivoTrue(Long id);

    @Query("SELECT c FROM Cliente c WHERE c.activo = true AND (COALESCE(c.saldoMiga, 0) < 0 OR COALESCE(c.saldoRallado, 0) < 0)")
    List<Cliente> findDeudores();

    @Query("SELECT c FROM Cliente c WHERE c.activo = true AND (COALESCE(c.saldoMiga, 0) > 0 OR COALESCE(c.saldoRallado, 0) > 0)")
    List<Cliente> findConSaldo();

    @Query("SELECT COUNT(c) FROM Cliente c WHERE c.activo = true")
    long countActivos();

    @Query("SELECT COUNT(c) FROM Cliente c WHERE c.activo = true AND (COALESCE(c.saldoMiga, 0) < 0 OR COALESCE(c.saldoRallado, 0) < 0)")
    long countDeudores();

    @Query("SELECT COUNT(c) FROM Cliente c WHERE c.activo = true AND (COALESCE(c.saldoMiga, 0) > 0 OR COALESCE(c.saldoRallado, 0) > 0)")
    long countConSaldo();

    @Query("SELECT COALESCE(SUM((CASE WHEN COALESCE(c.saldoMiga, 0) < 0 THEN ABS(COALESCE(c.saldoMiga, 0)) ELSE 0 END) + (CASE WHEN COALESCE(c.saldoRallado, 0) < 0 THEN ABS(COALESCE(c.saldoRallado, 0)) ELSE 0 END)), 0) FROM Cliente c WHERE c.activo = true")
    BigDecimal sumDeuda();

    @Query("SELECT COALESCE(SUM((CASE WHEN COALESCE(c.saldoMiga, 0) > 0 THEN COALESCE(c.saldoMiga, 0) ELSE 0 END) + (CASE WHEN COALESCE(c.saldoRallado, 0) > 0 THEN COALESCE(c.saldoRallado, 0) ELSE 0 END)), 0) FROM Cliente c WHERE c.activo = true")
    BigDecimal sumSaldoAFavor();
}
