package com.libreria.sistema.service;

import com.libreria.sistema.dto.request.UsuarioRequest;
import com.libreria.sistema.dto.response.UsuarioResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UsuarioService {

    Page<UsuarioResponse> listar(String busqueda, Pageable pageable);

    UsuarioResponse buscarPorId(Long id);

    UsuarioResponse crear(UsuarioRequest request);

    UsuarioResponse actualizar(Long id, UsuarioRequest request);

    void eliminar(Long id);

    void cambiarEstado(Long id, boolean estado);
}
