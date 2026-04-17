package com.irms.ordering_service.dto;

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
    private List<OrderItemResponseDTO> items;
    private Float totalPrice;
    private Float finalPrice;
    private LocalDateTime createdAt;
    private String status;
}
