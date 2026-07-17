package com.libreria.sistema.service.impl;

import com.libreria.sistema.dto.response.LibroResponse;
import com.libreria.sistema.entity.Libro;
import com.libreria.sistema.exception.ResourceNotFoundException;
import com.libreria.sistema.exception.ValidationException;
import com.libreria.sistema.repository.LibroRepository;
import com.libreria.sistema.service.InventarioService;
import com.libreria.sistema.service.LibroService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class InventarioServiceImpl implements InventarioService {

    private final LibroRepository libroRepository;
    private final LibroService libroService;

    @Override
    @Transactional(readOnly = true)
    public Page<LibroResponse> listarInventario(String busqueda, Pageable pageable) {
        return libroService.listar(busqueda, null, null, pageable);
    }

    @Override
    public LibroResponse ajustarStock(Long libroId, int cantidad, String motivo) {
        Libro libro = libroRepository.findById(libroId)
                .orElseThrow(() -> new ResourceNotFoundException("Libro no encontrado con id: " + libroId));
        int nuevoStock = libro.getStock() + cantidad;
        if (nuevoStock < 0) {
            throw new ValidationException("El ajuste resultaría en stock negativo. Stock actual: " + libro.getStock());
        }
        libro.setStock(nuevoStock);
        libroRepository.save(libro);
        return libroService.buscarPorId(libroId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LibroResponse> alertasBajoStock() {
        return libroService.librosBajoStock(5);
    }
}
