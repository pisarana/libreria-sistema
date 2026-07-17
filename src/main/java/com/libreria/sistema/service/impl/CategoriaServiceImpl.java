package com.libreria.sistema.service.impl;

import com.libreria.sistema.dto.request.CategoriaRequest;
import com.libreria.sistema.dto.response.CategoriaResponse;
import com.libreria.sistema.entity.Categoria;
import com.libreria.sistema.exception.DuplicateResourceException;
import com.libreria.sistema.exception.ResourceNotFoundException;
import com.libreria.sistema.exception.ValidationException;
import com.libreria.sistema.repository.CategoriaRepository;
import com.libreria.sistema.service.CategoriaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoriaServiceImpl implements CategoriaService {

    private final CategoriaRepository categoriaRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CategoriaResponse> listarTodos() {
        return categoriaRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CategoriaResponse buscarPorId(Long id) {
        return toResponse(findById(id));
    }

    @Override
    public CategoriaResponse crear(CategoriaRequest request) {
        if (categoriaRepository.existsByNombreIgnoreCase(request.getNombre())) {
            throw new DuplicateResourceException("Ya existe una categoría con ese nombre");
        }
        Categoria categoria = Categoria.builder()
                .nombre(request.getNombre())
                .descripcion(request.getDescripcion())
                .build();
        return toResponse(categoriaRepository.save(categoria));
    }

    @Override
    public CategoriaResponse actualizar(Long id, CategoriaRequest request) {
        Categoria categoria = findById(id);
        categoria.setNombre(request.getNombre());
        categoria.setDescripcion(request.getDescripcion());
        return toResponse(categoriaRepository.save(categoria));
    }

    @Override
    public void eliminar(Long id) {
        Categoria categoria = findById(id);
        if (categoria.getLibros() != null && !categoria.getLibros().isEmpty()) {
            throw new ValidationException("No se puede eliminar la categoría porque tiene libros asociados");
        }
        categoriaRepository.delete(categoria);
    }

    private Categoria findById(Long id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con id: " + id));
    }

    private CategoriaResponse toResponse(Categoria categoria) {
        return CategoriaResponse.builder()
                .id(categoria.getId())
                .nombre(categoria.getNombre())
                .descripcion(categoria.getDescripcion())
                .totalLibros(categoria.getLibros() != null ? categoria.getLibros().size() : 0)
                .build();
    }
}
