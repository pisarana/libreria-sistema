package com.libreria.sistema.repository;

import com.libreria.sistema.entity.Libro;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;

import java.util.List;
import java.util.Optional;

public interface LibroRepository extends JpaRepository<Libro, Long>, JpaSpecificationExecutor<Libro> {

    Page<Libro> findByTituloContainingIgnoreCase(String titulo, Pageable pageable);

    Optional<Libro> findByIsbn(String isbn);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select l from Libro l where l.id = :id")
    Optional<Libro> findByIdForUpdate(@Param("id") Long id);

    boolean existsByIsbn(String isbn);

    List<Libro> findByStockLessThanEqual(int stock);

    Page<Libro> findByAutor_Id(Long autorId, Pageable pageable);

    Page<Libro> findByCategoria_Id(Long categoriaId, Pageable pageable);
}
