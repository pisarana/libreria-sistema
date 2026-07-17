package com.libreria.sistema.service;

import com.libreria.sistema.dto.request.AutorRequest;
import com.libreria.sistema.dto.response.AutorResponse;

import java.util.List;

public interface AutorService {

    List<AutorResponse> listarTodos();

    AutorResponse buscarPorId(Long id);

    AutorResponse crear(AutorRequest request);

    AutorResponse actualizar(Long id, AutorRequest request);

    void eliminar(Long id);

    List<AutorResponse> buscar(String termino);
}
