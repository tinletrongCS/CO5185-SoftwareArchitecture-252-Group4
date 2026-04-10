package com.irms.inventory_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Event được publish lên RabbitMQ khi số lượng món thay đổi.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryChangedEvent {
    private Long itemId;
    private String itemName;
    private String category;
    private Integer oldQuantity;
    private Integer newQuantity;
    private Boolean available;
    /**
     * Loại thay đổi: UPDATED, CREATED, DELETED, OUT_OF_STOCK
     */
    private String changeType;
}
