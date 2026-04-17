package com.irms.ordering_service.dto;

import java.util.List;
import lombok.Data;

@Data
public class OrderRequestDTO {

    private String tableId;
    private String userName;
    private Float totalPrice;
    private List<OrderItemRequestDTO> items;
}
