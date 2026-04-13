package com.irms.inventory_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderPlacedEventDTO {
    private Long orderId;
    private List<OrderItemEvent> items;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemEvent {
        private Long itemId;
        private String itemName;
        private Integer quantity;
    }
}
