package com.irms.ordering_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemResponseDTO {
    private Long id;
    private Long inventoryItemId;
    private String itemName;
    private Integer quantity;
    private Float unitPrice;
    private Boolean isCompleted;
}
