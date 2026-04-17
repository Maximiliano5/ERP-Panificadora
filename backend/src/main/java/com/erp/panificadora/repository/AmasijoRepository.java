package com.erp.panificadora.repository;

import com.erp.panificadora.model.Amasijo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AmasijoRepository extends JpaRepository<Amasijo, Long> {
}
