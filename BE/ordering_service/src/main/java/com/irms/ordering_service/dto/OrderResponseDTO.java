package com.irms.ordering_service.dto;

import com.irms.ordering_service.entity.OrderItemEntity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponseDTO {

    private Long id;
    private String tableId;
    private String userName;
    private List<OrderItemResponseDTO> items;
    private String status;
}
