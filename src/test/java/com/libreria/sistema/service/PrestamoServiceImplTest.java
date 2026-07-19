package com.libreria.sistema.service;

import com.libreria.sistema.dto.request.DetallePrestamoRequest;
import com.libreria.sistema.dto.request.PrestamoRequest;
import com.libreria.sistema.entity.Libro;
import com.libreria.sistema.entity.Usuario;
import com.libreria.sistema.exception.StockInsuficienteException;
import com.libreria.sistema.repository.LibroRepository;
import com.libreria.sistema.repository.PrestamoRepository;
import com.libreria.sistema.repository.UsuarioRepository;
import com.libreria.sistema.service.impl.PrestamoServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PrestamoServiceImplTest {

    @Mock
    private PrestamoRepository prestamoRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private LibroRepository libroRepository;

    @InjectMocks
    private PrestamoServiceImpl service;

    @Test
    void crearAgregaLineasDuplicadasAntesDeValidarStock() {
        Usuario usuario = Usuario.builder().estado(true).build();
        Libro libro = Libro.builder().titulo("Libro de prueba").stock(5).build();
        PrestamoRequest request = requestWithDetails(3, 2);

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(libroRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(libro));
        when(prestamoRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        service.crear(request);

        assertEquals(0, libro.getStock());
        verify(libroRepository, times(1)).findByIdForUpdate(10L);
        verify(libroRepository, times(2)).save(libro);
    }

    @Test
    void crearRechazaStockTotalDeLineasDuplicadas() {
        Usuario usuario = Usuario.builder().estado(true).build();
        Libro libro = Libro.builder().titulo("Libro de prueba").stock(4).build();
        PrestamoRequest request = requestWithDetails(3, 2);

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(libroRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(libro));

        assertThrows(StockInsuficienteException.class, () -> service.crear(request));

        assertEquals(4, libro.getStock());
        verify(libroRepository, never()).save(any(Libro.class));
        verify(prestamoRepository, never()).save(any());
    }

    private PrestamoRequest requestWithDetails(int firstQuantity, int secondQuantity) {
        DetallePrestamoRequest first = new DetallePrestamoRequest();
        first.setLibroId(10L);
        first.setCantidad(firstQuantity);
        DetallePrestamoRequest second = new DetallePrestamoRequest();
        second.setLibroId(10L);
        second.setCantidad(secondQuantity);

        PrestamoRequest request = new PrestamoRequest();
        request.setUsuarioId(1L);
        request.setDetalles(List.of(first, second));
        return request;
    }
}
