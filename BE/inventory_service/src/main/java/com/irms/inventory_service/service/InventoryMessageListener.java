package com.irms.inventory_service.service;

import com.irms.inventory_service.config.RabbitMQConfig;
import com.irms.inventory_service.dto.OrderPlacedEventDTO;
import com.irms.inventory_service.entity.InventoryItemEntity;
import com.irms.inventory_service.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class InventoryMessageListener {

    private final InventoryRepository inventoryRepository;

    @RabbitListener(queues = RabbitMQConfig.QUEUE_NAME)
    @Transactional
    public void handleOrderPlacedEvent(OrderPlacedEventDTO event) {
        System.out.println("Kho nhận được yêu cầu trừ món từ đơn hàng: " + event.getOrderId());

        for (OrderPlacedEventDTO.OrderItemEvent item : event.getItems()) {
            Optional<InventoryItemEntity> inventoryItemOpt = inventoryRepository.findById(item.getItemId());

            if (inventoryItemOpt.isPresent()) {
                InventoryItemEntity inventoryItem = inventoryItemOpt.get();
                int currentQty = inventoryItem.getQuantity();
                int deductQty = item.getQuantity();

                // Trừ số lượng
                if (currentQty >= deductQty) {
                    inventoryItem.setQuantity(currentQty - deductQty);
                    inventoryRepository.save(inventoryItem);
                    System.out.println("Đã trừ " + deductQty + " phần " + item.getItemName() + " trong kho.");
                } else {
                    System.err.println("CẢNH BÁO: Kho không đủ món " + item.getItemName() + "! Cần: " + deductQty + ", Còn: " + currentQty);
                    // Xem xét bằn 1 sự kiện ngược lại để hủy order
                }
            } else {
                System.err.println("Không tìm thấy món ăn trong kho: " + item.getItemName());
            }
        }
    }
}