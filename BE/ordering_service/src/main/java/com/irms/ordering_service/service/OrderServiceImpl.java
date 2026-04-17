package com.irms.ordering_service.service;

import com.irms.ordering_service.config.RabbitMQConfig;
import com.irms.ordering_service.dto.*;
import com.irms.ordering_service.entity.OrderEntity;
import com.irms.ordering_service.entity.OrderItemEntity;
import com.irms.ordering_service.repository.OrderRepository;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final RabbitTemplate rabbitTemplate;

    @Override
    public OrderResponseDTO placeOrder(OrderRequestDTO orderRequestDTO) {
        OrderEntity order = getOrder(orderRequestDTO);
        
        order.setCreatedAt(ZonedDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")).toLocalDateTime());

        OrderEntity saved = orderRepository.save(order);
        List<OrderPlacedEventDTO.OrderItemEvent> evenItems = saved.getItems().stream()
                        .map(item -> new OrderPlacedEventDTO.OrderItemEvent(item.getInventoryItemId(), item.getItemName(), item.getQuantity()))
                        .toList();

        OrderPlacedEventDTO event = new OrderPlacedEventDTO(saved.getId(), evenItems);

        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, "order.created", event);
        System.out.println("Event published to RabbitMQ for inventory update: " + saved.getId());

        return toResponseDTO(saved);
    }

    private static OrderEntity getOrder(OrderRequestDTO orderRequestDTO) {
        OrderEntity order = new OrderEntity();
        order.setTableId(orderRequestDTO.getTableId());
        order.setUserName(orderRequestDTO.getUserName());
        order.setTotalPrice(orderRequestDTO.getTotalPrice());
        order.setStatus("PENDING");

        if (orderRequestDTO.getItems() != null) {
            for (OrderItemRequestDTO itemDto : orderRequestDTO.getItems()) {
                OrderItemEntity itemEntity = new OrderItemEntity();
                itemEntity.setInventoryItemId(itemDto.getInventoryItemId());
                itemEntity.setItemName(itemDto.getItemName());
                itemEntity.setQuantity(itemDto.getQuantity());
                itemEntity.setUnitPrice(itemDto.getUnitPrice());
                itemEntity.setIsCompleted(false);

                order.addItem(itemEntity);
            }
        }
        return order;
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponseDTO> getAllOrders() {
        return orderRepository.findAllWithItems()
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Override
    public List<OrderResponseDTO> getOrdersByUser(String userName) {
        return orderRepository.findByUserName(userName)
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponseDTO getOrderById(Long id) {
        OrderEntity order = orderRepository.findByIdWithItems(id)
                .orElseThrow(() -> new RuntimeException("Order not found: " + id));
        return toResponseDTO(order);
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

    @Override
    public OrderResponseDTO updateFinalPrice(Long id, Float finalPrice) {
        OrderEntity order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found: " + id));
        order.setFinalPrice(finalPrice);
        order.setStatus("AWAITING_PAYMENT");
        OrderEntity updated = orderRepository.save(order);
        return toResponseDTO(updated);
    }

    private OrderResponseDTO toResponseDTO(OrderEntity entity) {
        List<OrderItemResponseDTO> itemDTOs = null;

        if (entity.getItems() != null) {
            itemDTOs = entity.getItems().stream()
                    .map(item -> new OrderItemResponseDTO(
                            item.getId(),
                            item.getInventoryItemId(),
                            item.getItemName(),
                            item.getQuantity(),
                            item.getUnitPrice(),
                            item.getIsCompleted()
                    ))
                    .toList();
        }

        return new OrderResponseDTO(
                entity.getId(),
                entity.getTableId(),
                entity.getUserName(),
                itemDTOs,
                entity.getTotalPrice(),
                entity.getFinalPrice(),
                entity.getCreatedAt(),
                entity.getStatus()
        );
    }
}