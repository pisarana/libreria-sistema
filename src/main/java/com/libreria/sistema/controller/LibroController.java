package com.libreria.sistema.controller;

import com.libreria.sistema.dto.request.LibroRequest;
import com.libreria.sistema.dto.response.LibroResponse;
import com.libreria.sistema.service.LibroService;
import com.libreria.sistema.util.ApiResponse;
import com.libreria.sistema.util.PageResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.annotation.Validated;
import org.springframework.data.domain.Sort;

@RestController
@RequestMapping("/api/libros")
@Validated
@RequiredArgsConstructor
public class LibroController {

    private final LibroService libroService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<LibroResponse>>> listar(
            @RequestParam(required = false) String busqueda,
            @RequestParam(required = false) Long autorId,
            @RequestParam(required = false) Long categoriaId,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "id"));
        return ResponseEntity.ok(ApiResponse.success(
                PageResponse.from(libroService.listar(busqueda, autorId, categoriaId, pageable))));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LibroResponse>> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(libroService.buscarPorId(id)));
    }

    @GetMapping("/isbn/{isbn}")
    public ResponseEntity<ApiResponse<LibroResponse>> buscarPorIsbn(@PathVariable String isbn) {
        return ResponseEntity.ok(ApiResponse.success(libroService.buscarPorIsbn(isbn)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<LibroResponse>> crear(@Valid @RequestBody LibroRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(libroService.crear(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<LibroResponse>> actualizar(
            @PathVariable Long id, @Valid @RequestBody LibroRequest request) {
        return ResponseEntity.ok(ApiResponse.success(libroService.actualizar(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long id) {
        libroService.eliminar(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
