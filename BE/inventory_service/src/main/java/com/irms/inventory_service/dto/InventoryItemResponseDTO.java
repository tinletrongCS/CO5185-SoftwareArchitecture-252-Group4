package com.irms.inventory_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryItemResponseDTO {
    private Long id;
    private String name;
    private String category;
    private String description;
    private Float price;
    private Integer quantity;
    private Boolean available;
    private String imageUrl;
}
