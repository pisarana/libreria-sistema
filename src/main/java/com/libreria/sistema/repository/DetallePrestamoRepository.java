package com.libreria.sistema.repository;

import com.libreria.sistema.entity.DetallePrestamo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface DetallePrestamoRepository extends JpaRepository<DetallePrestamo, Long>, JpaSpecificationExecutor<DetallePrestamo> {

    List<DetallePrestamo> findByPrestamo_Id(Long prestamoId);

    @Transactional
    void deleteByPrestamo_Id(Long prestamoId);
}
