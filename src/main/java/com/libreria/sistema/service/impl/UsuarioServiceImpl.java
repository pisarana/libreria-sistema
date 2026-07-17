package com.libreria.sistema.service.impl;

import com.libreria.sistema.dto.request.UsuarioRequest;
import com.libreria.sistema.dto.response.UsuarioResponse;
import com.libreria.sistema.entity.Usuario;
import com.libreria.sistema.exception.DuplicateResourceException;
import com.libreria.sistema.exception.ResourceNotFoundException;
import com.libreria.sistema.repository.UsuarioRepository;
import com.libreria.sistema.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class UsuarioServiceImpl implements UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public Page<UsuarioResponse> listar(String busqueda, Pageable pageable) {
        if (busqueda != null && !busqueda.isBlank()) {
            return usuarioRepository
                    .findByNombreContainingIgnoreCaseOrApellidoContainingIgnoreCase(busqueda, busqueda, pageable)
                    .map(this::toResponse);
        }
        return usuarioRepository.findAll(pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public UsuarioResponse buscarPorId(Long id) {
        return toResponse(findById(id));
    }

    @Override
    public UsuarioResponse crear(UsuarioRequest request) {
        if (usuarioRepository.existsByCorreo(request.getCorreo())) {
            throw new DuplicateResourceException("Ya existe un usuario con el correo: " + request.getCorreo());
        }
        Usuario usuario = Usuario.builder()
                .nombre(request.getNombre())
                .apellido(request.getApellido())
                .correo(request.getCorreo())
                .password(passwordEncoder.encode(request.getPassword()))
                .rol(request.getRol())
                .estado(request.getEstado() != null ? request.getEstado() : true)
                .build();
        return toResponse(usuarioRepository.save(usuario));
    }

    @Override
    public UsuarioResponse actualizar(Long id, UsuarioRequest request) {
        Usuario usuario = findById(id);
        if (!usuario.getCorreo().equals(request.getCorreo())
                && usuarioRepository.existsByCorreo(request.getCorreo())) {
            throw new DuplicateResourceException("Ya existe un usuario con el correo: " + request.getCorreo());
        }
        usuario.setNombre(request.getNombre());
        usuario.setApellido(request.getApellido());
        usuario.setCorreo(request.getCorreo());
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        usuario.setRol(request.getRol());
        if (request.getEstado() != null) {
            usuario.setEstado(request.getEstado());
        }
        return toResponse(usuarioRepository.save(usuario));
    }

    @Override
    public void eliminar(Long id) {
        Usuario usuario = findById(id);
        usuarioRepository.delete(usuario);
    }

    @Override
    public void cambiarEstado(Long id, boolean estado) {
        Usuario usuario = findById(id);
        usuario.setEstado(estado);
        usuarioRepository.save(usuario);
    }

    private Usuario findById(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id: " + id));
    }

    private UsuarioResponse toResponse(Usuario usuario) {
        return UsuarioResponse.builder()
                .id(usuario.getId())
                .nombre(usuario.getNombre())
                .apellido(usuario.getApellido())
                .correo(usuario.getCorreo())
                .rol(usuario.getRol())
                .estado(usuario.isEstado())
                .fechaCreacion(usuario.getFechaCreacion())
                .build();
    }
}
