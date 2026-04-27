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

    List<Cliente> findByActivoTrueAndSaldoLessThan(BigDecimal valor);

    List<Cliente> findByActivoTrueAndSaldoGreaterThan(BigDecimal valor);

    @Query("SELECT COUNT(c) FROM Cliente c WHERE c.activo = true")
    long countActivos();

    @Query("SELECT COUNT(c) FROM Cliente c WHERE c.activo = true AND c.saldo < 0")
    long countDeudores();

    @Query("SELECT COUNT(c) FROM Cliente c WHERE c.activo = true AND c.saldo > 0")
    long countConSaldo();

    @Query("SELECT COALESCE(SUM(ABS(c.saldo)), 0) FROM Cliente c WHERE c.activo = true AND c.saldo < 0")
    BigDecimal sumDeuda();

    @Query("SELECT COALESCE(SUM(c.saldo), 0) FROM Cliente c WHERE c.activo = true AND c.saldo > 0")
    BigDecimal sumSaldoAFavor();
}
