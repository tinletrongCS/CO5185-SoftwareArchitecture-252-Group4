package com.irms.inventory_service.dto;

import lombok.Data;

@Data
public class ReserveTableRequestDTO {
    private String tableName;
    private Integer capacity;
    private String category;
    private String zone;
    private Integer positionX;
    private Integer positionY;
    private Boolean available = true;
    private String description;
}
