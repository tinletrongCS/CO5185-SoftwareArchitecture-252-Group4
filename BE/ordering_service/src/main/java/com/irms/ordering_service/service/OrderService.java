package com.irms.ordering_service.service;

import com.irms.ordering_service.dto.OrderRequestDTO;
import com.irms.ordering_service.dto.OrderResponseDTO;

import java.util.List;

public interface OrderService {

    OrderResponseDTO placeOrder(OrderRequestDTO orderRequestDTO);
    List<OrderResponseDTO> getAllOrders();
    OrderResponseDTO getOrderById(Long id);
    OrderResponseDTO updateOrderStatus(Long id, String status);

    void deleteOrder(Long id);
}
