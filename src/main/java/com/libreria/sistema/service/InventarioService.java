package com.libreria.sistema.service;

import com.libreria.sistema.dto.response.LibroResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface InventarioService {

    Page<LibroResponse> listarInventario(String busqueda, Pageable pageable);

    LibroResponse ajustarStock(Long libroId, int cantidad, String motivo);

    List<LibroResponse> alertasBajoStock();
}
