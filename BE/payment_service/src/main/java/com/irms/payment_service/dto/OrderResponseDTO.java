package com.irms.payment_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponseDTO {
    private Long id;
    private String tableId;
    private String userName;
    private List<OrderItemDTO> items;
    private Float totalPrice;
    private Float finalPrice;
    private LocalDateTime createdAt;
    private String status;
}
