package com.irms.inventory_service.dto;

import lombok.Data;

@Data
public class InventoryItemRequestDTO {
    private String name;
    private String category;
    private String description;
    private Float price;
    private Integer quantity;
    private Boolean available = true;
    private String imageUrl;
}
