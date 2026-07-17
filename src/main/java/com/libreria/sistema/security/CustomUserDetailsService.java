package com.libreria.sistema.security;

import com.libreria.sistema.entity.Usuario;
import com.libreria.sistema.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Implementa UserDetailsService de Spring Security para cargar
 * el usuario desde la base de datos durante la autenticación.
 *
 * Polimorfismo aplicado: implementa la interfaz UserDetailsService
 * del framework; Spring Security llama a loadUserByUsername()
 * sin saber qué implementación concreta está usando.
 *
 * Inyección de dependencias: UsuarioRepository inyectado por
 * constructor (patrón recomendado por Spring, inmutable).
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    /**
     * Busca el usuario por correo electrónico (usado como username).
     * Verifica que el usuario esté activo antes de autenticar.
     *
     * @param correo correo electrónico del usuario
     * @return UserDetails con credenciales y rol
     * @throws UsernameNotFoundException si el usuario no existe o está inactivo
     */
    @Override
    public UserDetails loadUserByUsername(String correo) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Usuario no encontrado: " + correo));

        if (!usuario.isEstado()) {
            throw new UsernameNotFoundException("Usuario desactivado: " + correo);
        }

        // El rol se guarda como "ADMIN" o "EMPLEADO"; Spring Security
        // requiere el prefijo "ROLE_" para hasRole() en SecurityConfig
        SimpleGrantedAuthority authority =
                new SimpleGrantedAuthority("ROLE_" + usuario.getRol().name());

        return new User(
                usuario.getCorreo(),
                usuario.getPassword(),
                List.of(authority)
        );
    }
}
