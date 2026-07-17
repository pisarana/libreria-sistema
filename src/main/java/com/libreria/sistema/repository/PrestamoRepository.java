package com.libreria.sistema.repository;

import com.libreria.sistema.entity.Prestamo;
import com.libreria.sistema.entity.enums.EstadoPrestamo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface PrestamoRepository extends JpaRepository<Prestamo, Long>, JpaSpecificationExecutor<Prestamo> {

    Page<Prestamo> findByUsuario_Id(Long usuarioId, Pageable pageable);

    Page<Prestamo> findByEstado(EstadoPrestamo estado, Pageable pageable);

    List<Prestamo> findTop5ByOrderByFechaCreacionDesc();

    @Query("SELECT FUNCTION('DATE_TRUNC', 'month', p.fechaPrestamo) as mes, COUNT(p) as total " +
           "FROM Prestamo p WHERE p.fechaPrestamo >= :desde " +
           "GROUP BY FUNCTION('DATE_TRUNC', 'month', p.fechaPrestamo) ORDER BY mes")
    List<Object[]> countByMes(@Param("desde") LocalDate desde);

    long countByEstado(EstadoPrestamo estado);
}
