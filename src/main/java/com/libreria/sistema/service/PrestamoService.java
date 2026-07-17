package com.libreria.sistema.service;

import com.libreria.sistema.dto.request.PrestamoRequest;
import com.libreria.sistema.dto.response.PrestamoResponse;
import com.libreria.sistema.entity.enums.EstadoPrestamo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface PrestamoService {

    Page<PrestamoResponse> listar(EstadoPrestamo estado, Long usuarioId, Pageable pageable);

    PrestamoResponse buscarPorId(Long id);

    PrestamoResponse crear(PrestamoRequest request);

    PrestamoResponse devolver(Long id);

    void eliminar(Long id);

    List<PrestamoResponse> ultimosPrestamos(int cantidad);

    List<Object[]> prestamosPorMes(int meses);
}
