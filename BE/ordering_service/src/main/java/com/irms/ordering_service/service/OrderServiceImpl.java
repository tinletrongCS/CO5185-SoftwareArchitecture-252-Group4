package com.irms.ordering_service.service;

import com.irms.ordering_service.config.RabbitMQConfig;
import com.irms.ordering_service.entity.OrderEntity;
import com.irms.ordering_service.repository.OrderRepository;
import com.irms.ordering_service.dto.OrderRequestDTO;
import com.irms.ordering_service.dto.OrderResponseDTO;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final RabbitTemplate rabbitTemplate;
    @Override
    public OrderResponseDTO placeOrder(OrderRequestDTO orderRequestDTO) {
        OrderEntity order = new OrderEntity();
        order.setTableId(orderRequestDTO.getTableId());
        order.setItemsList(orderRequestDTO.getItems());
        order.setStatus("PENDING");

        OrderEntity saved = orderRepository.save(order);
        OrderResponseDTO responseDTO = toResponseDTO(saved);

        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, RabbitMQConfig.ROUTING_KEY, responseDTO);
        System.out.println("Đã gửi thông báo đơn hàng mới lên RabbitMQ: " + responseDTO.getId());
        return responseDTO;
    }

    @Override
    public List<OrderResponseDTO> getAllOrders() {
        return orderRepository.findAll()
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Override
    public OrderResponseDTO updateOrderStatus(Long id, String status) {
        OrderEntity order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found: " + id));
        order.setStatus(status);
        OrderEntity updated = orderRepository.save(order);
        return toResponseDTO(updated);
    }

    @Override
    public void deleteOrder(Long id) {
        orderRepository.deleteById(id);
    }

    private OrderResponseDTO toResponseDTO(OrderEntity entity) {
        return new OrderResponseDTO(
                entity.getId(),
                entity.getTableId(),
                entity.getItemsList(),
                entity.getStatus()
        );
    }
}
