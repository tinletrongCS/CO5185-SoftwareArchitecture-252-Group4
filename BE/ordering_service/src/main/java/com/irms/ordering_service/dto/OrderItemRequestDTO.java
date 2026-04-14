package com.irms.ordering_service.dto;

import lombok.Data;

@Data
public class OrderItemRequestDTO {
    private Long inventoryItemId;
    private String itemName;
    private Integer quantity;
    private Float unitPrice;
    private Boolean isCompleted = Boolean.FALSE;
}
