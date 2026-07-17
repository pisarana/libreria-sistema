package com.libreria.sistema.controller;

import com.libreria.sistema.dto.response.LibroResponse;
import com.libreria.sistema.service.InventarioService;
import com.libreria.sistema.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventario")
@RequiredArgsConstructor
public class InventarioController {

    private final InventarioService inventarioService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<LibroResponse>>> listar(
            @RequestParam(required = false) String busqueda,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(ApiResponse.success(inventarioService.listarInventario(busqueda, pageable)));
    }

    @GetMapping("/alertas")
    public ResponseEntity<ApiResponse<List<LibroResponse>>> alertas() {
        return ResponseEntity.ok(ApiResponse.success(inventarioService.alertasBajoStock()));
    }

    @PutMapping("/{id}/stock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<LibroResponse>> ajustarStock(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        int cantidad = ((Number) body.get("cantidad")).intValue();
        String motivo = (String) body.getOrDefault("motivo", "");
        return ResponseEntity.ok(ApiResponse.success(inventarioService.ajustarStock(id, cantidad, motivo)));
    }
}
