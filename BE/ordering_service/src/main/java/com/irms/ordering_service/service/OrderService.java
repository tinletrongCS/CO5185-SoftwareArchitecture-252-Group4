package com.irms.ordering_service.service;

import com.irms.ordering_service.dto.OrderRequestDTO;
import com.irms.ordering_service.dto.OrderResponseDTO;

import java.util.List;

public interface OrderService {

    OrderResponseDTO placeOrder(OrderRequestDTO orderRequestDTO);
    List<OrderResponseDTO> getAllOrders();
    List<OrderResponseDTO> getOrdersByUser(String userName);
    OrderResponseDTO getOrderById(Long id);
    OrderResponseDTO updateOrderStatus(Long id, String status);
    OrderResponseDTO updateFinalPrice(Long id, Float finalPrice);

    void deleteOrder(Long id);
}
