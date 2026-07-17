package com.libreria.sistema.service.impl;

import com.libreria.sistema.dto.request.AutorRequest;
import com.libreria.sistema.dto.response.AutorResponse;
import com.libreria.sistema.entity.Autor;
import com.libreria.sistema.exception.DuplicateResourceException;
import com.libreria.sistema.exception.ResourceNotFoundException;
import com.libreria.sistema.exception.ValidationException;
import com.libreria.sistema.repository.AutorRepository;
import com.libreria.sistema.service.AutorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AutorServiceImpl implements AutorService {

    private final AutorRepository autorRepository;

    @Override
    @Transactional(readOnly = true)
    public List<AutorResponse> listarTodos() {
        return autorRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AutorResponse buscarPorId(Long id) {
        return toResponse(findById(id));
    }

    @Override
    public AutorResponse crear(AutorRequest request) {
        if (autorRepository.existsByNombreAndApellido(request.getNombre(), request.getApellido())) {
            throw new DuplicateResourceException("Ya existe un autor con ese nombre y apellido");
        }
        Autor autor = Autor.builder()
                .nombre(request.getNombre())
                .apellido(request.getApellido())
                .nacionalidad(request.getNacionalidad())
                .build();
        return toResponse(autorRepository.save(autor));
    }

    @Override
    public AutorResponse actualizar(Long id, AutorRequest request) {
        Autor autor = findById(id);
        autor.setNombre(request.getNombre());
        autor.setApellido(request.getApellido());
        autor.setNacionalidad(request.getNacionalidad());
        return toResponse(autorRepository.save(autor));
    }

    @Override
    public void eliminar(Long id) {
        Autor autor = findById(id);
        if (autor.getLibros() != null && !autor.getLibros().isEmpty()) {
            throw new ValidationException("No se puede eliminar el autor porque tiene libros asociados");
        }
        autorRepository.delete(autor);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AutorResponse> buscar(String termino) {
        return autorRepository
                .findByNombreContainingIgnoreCaseOrApellidoContainingIgnoreCase(termino, termino)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private Autor findById(Long id) {
        return autorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Autor no encontrado con id: " + id));
    }

    private AutorResponse toResponse(Autor autor) {
        return AutorResponse.builder()
                .id(autor.getId())
                .nombre(autor.getNombre())
                .apellido(autor.getApellido())
                .nacionalidad(autor.getNacionalidad())
                .totalLibros(autor.getLibros() != null ? autor.getLibros().size() : 0)
                .build();
    }
}
