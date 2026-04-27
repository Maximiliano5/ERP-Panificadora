package com.erp.panificadora.repository;

import com.erp.panificadora.model.PagoCliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PagoClienteRepository extends JpaRepository<PagoCliente, Long> {

    List<PagoCliente> findByClienteIdOrderByFechaDesc(Long clienteId);
}
