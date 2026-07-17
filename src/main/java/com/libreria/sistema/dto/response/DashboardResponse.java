package com.libreria.sistema.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {

    private long totalLibros;
    private long totalUsuarios;
    private long totalAutores;
    private long totalCategorias;
    private long totalPrestamos;
    private long prestamosActivos;
    private List<LibroResponse> librosBajoStock;
    private List<PrestamoResponse> ultimosPrestamos;
    private List<MesPrestamoDto> prestamosPorMes;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MesPrestamoDto {
        private String mes;
        private Long total;
    }
}
