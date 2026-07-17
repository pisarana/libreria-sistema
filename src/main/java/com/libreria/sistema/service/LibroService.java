package com.libreria.sistema.service;

import com.libreria.sistema.dto.request.LibroRequest;
import com.libreria.sistema.dto.response.LibroResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface LibroService {

    Page<LibroResponse> listar(String busqueda, Long autorId, Long categoriaId, Pageable pageable);

    LibroResponse buscarPorId(Long id);

    LibroResponse buscarPorIsbn(String isbn);

    LibroResponse crear(LibroRequest request);

    LibroResponse actualizar(Long id, LibroRequest request);

    void eliminar(Long id);

    List<LibroResponse> librosBajoStock(int limite);
}
