package com.libreria.sistema.service.impl;

import com.libreria.sistema.dto.request.DetallePrestamoRequest;
import com.libreria.sistema.dto.request.PrestamoRequest;
import com.libreria.sistema.dto.response.DetallePrestamoResponse;
import com.libreria.sistema.dto.response.PrestamoResponse;
import com.libreria.sistema.entity.DetallePrestamo;
import com.libreria.sistema.entity.Libro;
import com.libreria.sistema.entity.Prestamo;
import com.libreria.sistema.entity.Usuario;
import com.libreria.sistema.entity.enums.EstadoPrestamo;
import com.libreria.sistema.exception.ResourceNotFoundException;
import com.libreria.sistema.exception.StockInsuficienteException;
import com.libreria.sistema.exception.ValidationException;
import com.libreria.sistema.repository.LibroRepository;
import com.libreria.sistema.repository.PrestamoRepository;
import com.libreria.sistema.repository.UsuarioRepository;
import com.libreria.sistema.service.PrestamoService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PrestamoServiceImpl implements PrestamoService {

    private final PrestamoRepository prestamoRepository;
    private final UsuarioRepository usuarioRepository;
    private final LibroRepository libroRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<PrestamoResponse> listar(EstadoPrestamo estado, Long usuarioId, Pageable pageable) {
        if (usuarioId != null) {
            return prestamoRepository.findByUsuario_Id(usuarioId, pageable).map(this::toResponse);
        }
        if (estado != null) {
            return prestamoRepository.findByEstado(estado, pageable).map(this::toResponse);
        }
        return prestamoRepository.findAll(pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public PrestamoResponse buscarPorId(Long id) {
        return toResponse(findById(id));
    }

    @Override
    public PrestamoResponse crear(PrestamoRequest request) {
        Usuario usuario = usuarioRepository.findById(request.getUsuarioId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id: " + request.getUsuarioId()));

        if (!usuario.isEstado()) {
            throw new ValidationException("El usuario no está activo");
        }

        Prestamo prestamo = Prestamo.builder()
                .usuario(usuario)
                .fechaPrestamo(LocalDate.now())
                .fechaDevolucion(request.getFechaDevolucion())
                .estado(EstadoPrestamo.ACTIVO)
                .observaciones(request.getObservaciones())
                .build();

        Map<Long, Integer> cantidadesPorLibro = new LinkedHashMap<>();
        for (DetallePrestamoRequest detReq : request.getDetalles()) {
            int cantidad = detReq.getCantidad() != null ? detReq.getCantidad() : 1;
            cantidadesPorLibro.merge(detReq.getLibroId(), cantidad, Integer::sum);
        }

        Map<Long, Libro> librosPorId = new LinkedHashMap<>();
        for (Map.Entry<Long, Integer> entry : cantidadesPorLibro.entrySet()) {
            Libro libro = libroRepository.findByIdForUpdate(entry.getKey())
                    .orElseThrow(() -> new ResourceNotFoundException("Libro no encontrado con id: " + entry.getKey()));
            int cantidad = entry.getValue();
            if (libro.getStock() < cantidad) {
                throw new StockInsuficienteException(
                        "Stock insuficiente para '" + libro.getTitulo() + "'. Disponible: " + libro.getStock());
            }
            librosPorId.put(entry.getKey(), libro);
        }

        for (DetallePrestamoRequest detReq : request.getDetalles()) {
            Libro libro = librosPorId.get(detReq.getLibroId());
            int cantidad = detReq.getCantidad() != null ? detReq.getCantidad() : 1;
            libro.actualizarStock(-cantidad);
            libroRepository.save(libro);

            DetallePrestamo detalle = DetallePrestamo.builder()
                    .prestamo(prestamo)
                    .libro(libro)
                    .cantidad(cantidad)
                    .build();
            prestamo.getDetalles().add(detalle);
        }

        return toResponse(prestamoRepository.save(prestamo));
    }

    @Override
    public PrestamoResponse devolver(Long id) {
        Prestamo prestamo = findById(id);
        if (prestamo.getEstado() != EstadoPrestamo.ACTIVO) {
            throw new ValidationException("El préstamo no está activo");
        }

        for (DetallePrestamo detalle : prestamo.getDetalles()) {
            Libro libro = detalle.getLibro();
            libro.actualizarStock(detalle.getCantidad());
            libroRepository.save(libro);
        }

        prestamo.setEstado(EstadoPrestamo.DEVUELTO);
        prestamo.setFechaDevolucion(LocalDate.now());
        return toResponse(prestamoRepository.save(prestamo));
    }

    @Override
    public void eliminar(Long id) {
        Prestamo prestamo = findById(id);
        prestamoRepository.delete(prestamo);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PrestamoResponse> ultimosPrestamos(int cantidad) {
        return prestamoRepository.findTop5ByOrderByFechaCreacionDesc().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Object[]> prestamosPorMes(int meses) {
        LocalDate desde = LocalDate.now().minusMonths(meses);
        return prestamoRepository.countByMes(desde);
    }

    private Prestamo findById(Long id) {
        return prestamoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Préstamo no encontrado con id: " + id));
    }

    private PrestamoResponse toResponse(Prestamo prestamo) {
        List<DetallePrestamoResponse> detalles = prestamo.getDetalles().stream()
                .map(d -> DetallePrestamoResponse.builder()
                        .id(d.getId())
                        .libroId(d.getLibro() != null ? d.getLibro().getId() : null)
                        .libroTitulo(d.getLibro() != null ? d.getLibro().getTitulo() : null)
                        .cantidad(d.getCantidad())
                        .build())
                .collect(Collectors.toList());

        return PrestamoResponse.builder()
                .id(prestamo.getId())
                .usuarioId(prestamo.getUsuario() != null ? prestamo.getUsuario().getId() : null)
                .usuarioNombre(prestamo.getUsuario() != null
                        ? prestamo.getUsuario().getNombre() + " " + prestamo.getUsuario().getApellido() : null)
                .fechaPrestamo(prestamo.getFechaPrestamo())
                .fechaDevolucion(prestamo.getFechaDevolucion())
                .estado(prestamo.getEstado())
                .observaciones(prestamo.getObservaciones())
                .detalles(detalles)
                .fechaCreacion(prestamo.getFechaCreacion())
                .build();
    }
}
