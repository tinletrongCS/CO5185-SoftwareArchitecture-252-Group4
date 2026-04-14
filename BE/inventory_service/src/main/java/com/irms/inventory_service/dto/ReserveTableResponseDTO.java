package com.irms.inventory_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReserveTableResponseDTO {
    private Long id;
    private String tableName;
    private Integer capacity;
    private String category;
    private String zone;
    private Integer positionX;
    private Integer positionY;
    private Boolean available;
    private String description;
}
