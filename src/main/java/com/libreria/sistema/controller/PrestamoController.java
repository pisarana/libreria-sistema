package com.libreria.sistema.controller;

import com.libreria.sistema.dto.request.PrestamoRequest;
import com.libreria.sistema.dto.response.PrestamoResponse;
import com.libreria.sistema.entity.enums.EstadoPrestamo;
import com.libreria.sistema.service.PrestamoService;
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
@RequestMapping("/api/prestamos")
@Validated
@RequiredArgsConstructor
public class PrestamoController {

    private final PrestamoService prestamoService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<PrestamoResponse>>> listar(
            @RequestParam(required = false) EstadoPrestamo estado,
            @RequestParam(required = false) Long usuarioId,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        return ResponseEntity.ok(ApiResponse.success(
                PageResponse.from(prestamoService.listar(estado, usuarioId, pageable))));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PrestamoResponse>> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(prestamoService.buscarPorId(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PrestamoResponse>> crear(@Valid @RequestBody PrestamoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(prestamoService.crear(request)));
    }

    @PutMapping("/{id}/devolver")
    public ResponseEntity<ApiResponse<PrestamoResponse>> devolver(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(prestamoService.devolver(id)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long id) {
        prestamoService.eliminar(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
