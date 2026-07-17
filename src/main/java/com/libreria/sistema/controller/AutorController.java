package com.libreria.sistema.controller;

import com.libreria.sistema.dto.request.AutorRequest;
import com.libreria.sistema.dto.response.AutorResponse;
import com.libreria.sistema.service.AutorService;
import com.libreria.sistema.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/autores")
@RequiredArgsConstructor
public class AutorController {

    private final AutorService autorService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AutorResponse>>> listar() {
        return ResponseEntity.ok(ApiResponse.success(autorService.listarTodos()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AutorResponse>> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(autorService.buscarPorId(id)));
    }

    @GetMapping("/buscar")
    public ResponseEntity<ApiResponse<List<AutorResponse>>> buscar(@RequestParam String q) {
        return ResponseEntity.ok(ApiResponse.success(autorService.buscar(q)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AutorResponse>> crear(@Valid @RequestBody AutorRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(autorService.crear(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AutorResponse>> actualizar(
            @PathVariable Long id, @Valid @RequestBody AutorRequest request) {
        return ResponseEntity.ok(ApiResponse.success(autorService.actualizar(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long id) {
        autorService.eliminar(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
