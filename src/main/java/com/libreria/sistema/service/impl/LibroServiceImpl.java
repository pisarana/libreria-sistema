package com.libreria.sistema.service.impl;

import com.libreria.sistema.dto.request.LibroRequest;
import com.libreria.sistema.dto.response.LibroResponse;
import com.libreria.sistema.entity.Autor;
import com.libreria.sistema.entity.Categoria;
import com.libreria.sistema.entity.Libro;
import com.libreria.sistema.exception.DuplicateResourceException;
import com.libreria.sistema.exception.ResourceNotFoundException;
import com.libreria.sistema.repository.AutorRepository;
import com.libreria.sistema.repository.CategoriaRepository;
import com.libreria.sistema.repository.LibroRepository;
import com.libreria.sistema.service.LibroService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class LibroServiceImpl implements LibroService {

    private final LibroRepository libroRepository;
    private final AutorRepository autorRepository;
    private final CategoriaRepository categoriaRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<LibroResponse> listar(String busqueda, Long autorId, Long categoriaId, Pageable pageable) {
        if (autorId != null) {
            return libroRepository.findByAutor_Id(autorId, pageable).map(this::toResponse);
        }
        if (categoriaId != null) {
            return libroRepository.findByCategoria_Id(categoriaId, pageable).map(this::toResponse);
        }
        if (busqueda != null && !busqueda.isBlank()) {
            return libroRepository.findByTituloContainingIgnoreCase(busqueda, pageable).map(this::toResponse);
        }
        return libroRepository.findAll(pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public LibroResponse buscarPorId(Long id) {
        return toResponse(findById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public LibroResponse buscarPorIsbn(String isbn) {
        return toResponse(libroRepository.findByIsbn(isbn)
                .orElseThrow(() -> new ResourceNotFoundException("Libro no encontrado con ISBN: " + isbn)));
    }

    @Override
    public LibroResponse crear(LibroRequest request) {
        if (libroRepository.existsByIsbn(request.getIsbn())) {
            throw new DuplicateResourceException("Ya existe un libro con ISBN: " + request.getIsbn());
        }
        Autor autor = autorRepository.findById(request.getAutorId())
                .orElseThrow(() -> new ResourceNotFoundException("Autor no encontrado con id: " + request.getAutorId()));
        Categoria categoria = categoriaRepository.findById(request.getCategoriaId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con id: " + request.getCategoriaId()));

        Libro libro = Libro.builder()
                .titulo(request.getTitulo())
                .isbn(request.getIsbn())
                .precio(request.getPrecio())
                .stock(request.getStock() != null ? request.getStock() : 0)
                .descripcion(request.getDescripcion())
                .autor(autor)
                .categoria(categoria)
                .build();
        return toResponse(libroRepository.save(libro));
    }

    @Override
    public LibroResponse actualizar(Long id, LibroRequest request) {
        Libro libro = findById(id);
        if (!libro.getIsbn().equals(request.getIsbn()) && libroRepository.existsByIsbn(request.getIsbn())) {
            throw new DuplicateResourceException("Ya existe otro libro con ISBN: " + request.getIsbn());
        }
        Autor autor = autorRepository.findById(request.getAutorId())
                .orElseThrow(() -> new ResourceNotFoundException("Autor no encontrado con id: " + request.getAutorId()));
        Categoria categoria = categoriaRepository.findById(request.getCategoriaId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con id: " + request.getCategoriaId()));

        libro.setTitulo(request.getTitulo());
        libro.setIsbn(request.getIsbn());
        libro.setPrecio(request.getPrecio());
        libro.setStock(request.getStock() != null ? request.getStock() : libro.getStock());
        libro.setDescripcion(request.getDescripcion());
        libro.setAutor(autor);
        libro.setCategoria(categoria);
        return toResponse(libroRepository.save(libro));
    }

    @Override
    public void eliminar(Long id) {
        Libro libro = findById(id);
        libroRepository.delete(libro);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LibroResponse> librosBajoStock(int limite) {
        return libroRepository.findByStockLessThanEqual(limite).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private Libro findById(Long id) {
        return libroRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Libro no encontrado con id: " + id));
    }

    private LibroResponse toResponse(Libro libro) {
        return LibroResponse.builder()
                .id(libro.getId())
                .titulo(libro.getTitulo())
                .isbn(libro.getIsbn())
                .precio(libro.getPrecio())
                .stock(libro.getStock())
                .descripcion(libro.getDescripcion())
                .autorNombre(libro.getAutor() != null
                        ? libro.getAutor().getNombre() + " " + libro.getAutor().getApellido() : null)
                .categoriaId(libro.getCategoria() != null ? libro.getCategoria().getId() : null)
                .categoriaNombre(libro.getCategoria() != null ? libro.getCategoria().getNombre() : null)
                .fechaCreacion(libro.getFechaCreacion())
                .build();
    }
}
