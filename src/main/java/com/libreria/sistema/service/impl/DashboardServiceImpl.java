package com.libreria.sistema.service.impl;

import com.libreria.sistema.dto.response.DashboardResponse;
import com.libreria.sistema.dto.response.DashboardResponse.MesPrestamoDto;
import com.libreria.sistema.entity.enums.EstadoPrestamo;
import com.libreria.sistema.repository.*;
import com.libreria.sistema.service.DashboardService;
import com.libreria.sistema.service.LibroService;
import com.libreria.sistema.service.PrestamoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private final LibroRepository libroRepository;
    private final UsuarioRepository usuarioRepository;
    private final AutorRepository autorRepository;
    private final CategoriaRepository categoriaRepository;
    private final PrestamoRepository prestamoRepository;
    private final LibroService libroService;
    private final PrestamoService prestamoService;

    @Override
    public DashboardResponse getStats() {
        List<Object[]> rawMeses = prestamoRepository.countByMes(LocalDate.now().minusMonths(6));
        List<MesPrestamoDto> prestamosPorMes = rawMeses.stream()
                .map(row -> MesPrestamoDto.builder()
                        .mes(row[0] != null ? row[0].toString() : "")
                        .total(row[1] != null ? ((Number) row[1]).longValue() : 0L)
                        .build())
                .collect(Collectors.toList());

        return DashboardResponse.builder()
                .totalLibros(libroRepository.count())
                .totalUsuarios(usuarioRepository.count())
                .totalAutores(autorRepository.count())
                .totalCategorias(categoriaRepository.count())
                .totalPrestamos(prestamoRepository.count())
                .prestamosActivos(prestamoRepository.countByEstado(EstadoPrestamo.ACTIVO))
                .librosBajoStock(libroService.librosBajoStock(5))
                .ultimosPrestamos(prestamoService.ultimosPrestamos(5))
                .prestamosPorMes(prestamosPorMes)
                .build();
    }
}
