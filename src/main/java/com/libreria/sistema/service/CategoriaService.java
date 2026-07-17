package com.libreria.sistema.service;

import com.libreria.sistema.dto.request.CategoriaRequest;
import com.libreria.sistema.dto.response.CategoriaResponse;

import java.util.List;

public interface CategoriaService {

    List<CategoriaResponse> listarTodos();

    CategoriaResponse buscarPorId(Long id);

    CategoriaResponse crear(CategoriaRequest request);

    CategoriaResponse actualizar(Long id, CategoriaRequest request);

    void eliminar(Long id);
}
