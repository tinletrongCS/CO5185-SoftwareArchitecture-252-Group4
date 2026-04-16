package com.irms.inventory_service.service;

import com.irms.inventory_service.config.RabbitMQConfig;
import com.irms.inventory_service.dto.InventoryChangedEvent;
import com.irms.inventory_service.dto.InventoryItemRequestDTO;
import com.irms.inventory_service.dto.InventoryItemResponseDTO;
import com.irms.inventory_service.entity.InventoryItemEntity;
import com.irms.inventory_service.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;
    private final RabbitTemplate rabbitTemplate;

    // lấy hết bao gồm cả những món đã hết hoặc ngưng phục vụ 
    @Override
    public List<InventoryItemResponseDTO> getMenu() 
    {
        return inventoryRepository.findAll()
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Override
    public List<InventoryItemResponseDTO> getMenuByCategory(String category) 
    {
        return inventoryRepository.findByCategory(category)
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Override
    public List<InventoryItemResponseDTO> getAllItems() 
    {
        return inventoryRepository.findAll()
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Override
    public InventoryItemResponseDTO getItemById(Long id) 
    {
        InventoryItemEntity item = findOrThrow(id);
        return toResponseDTO(item);
    }

    @Override
    public List<InventoryItemResponseDTO> createItems(List<InventoryItemRequestDTO> dtos) 
    {
        return dtos.stream().map(dto -> {
            InventoryItemEntity item = new InventoryItemEntity();
            mapDtoToEntity(dto, item);
            InventoryItemEntity saved = inventoryRepository.save(item);

            publishEvent(new InventoryChangedEvent(
                    saved.getId(),
                    saved.getName(),
                    saved.getCategory(),
                    0,
                    saved.getQuantity(),
                    saved.getAvailable(),
                    "CREATED"
            ));

            return toResponseDTO(saved);
        }).toList();
    }

    @Override
    public InventoryItemResponseDTO updateItem(Long id, InventoryItemRequestDTO dto) 
    {
        InventoryItemEntity item = findOrThrow(id);
        int oldQuantity = item.getQuantity();

        mapDtoToEntity(dto, item);
        InventoryItemEntity updated = inventoryRepository.save(item);

        // Notify nếu số lượng thay đổi
        if (oldQuantity != updated.getQuantity()) {
            publishEvent(new InventoryChangedEvent(
                    updated.getId(),
                    updated.getName(),
                    updated.getCategory(),
                    oldQuantity,
                    updated.getQuantity(),
                    updated.getAvailable(),
                    updated.getQuantity() <= 0 ? "OUT_OF_STOCK" : "UPDATED"
            ));
        }

        return toResponseDTO(updated);
    }

    @Override
    public void deleteItem(Long id) {
        InventoryItemEntity item = findOrThrow(id);
        inventoryRepository.deleteById(id);

        publishEvent(new InventoryChangedEvent(
                item.getId(),
                item.getName(),
                item.getCategory(),
                item.getQuantity(),
                0,
                false,
                "DELETED"
        ));
    }

    @Override
    @Transactional
    public InventoryItemResponseDTO updateQuantity(Long id, int delta) 
    {
        InventoryItemEntity item = findOrThrow(id);
        int oldQuantity = item.getQuantity();
        int newQuantity = Math.max(0, oldQuantity + delta);

        item.setQuantity(newQuantity);

        // Tự động đánh dấu unavailable nếu hết hàng
        if (newQuantity <= 0) {
            item.setAvailable(false);
        }

        InventoryItemEntity updated = inventoryRepository.save(item);

        String changeType = newQuantity <= 0 ? "OUT_OF_STOCK" : "UPDATED";
        publishEvent(new InventoryChangedEvent(
                updated.getId(),
                updated.getName(),
                updated.getCategory(),
                oldQuantity,
                newQuantity,
                updated.getAvailable(),
                changeType
        ));

        System.out.println("[Inventory] Cập nhật số lượng item #" + id
                + ": " + oldQuantity + " -> " + newQuantity
                + (newQuantity <= 0 ? " [HẾT HÀNG]" : ""));

        return toResponseDTO(updated);
    }


    private InventoryItemEntity findOrThrow(Long id) {
        return inventoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inventory item not found: " + id));
    }

    private void mapDtoToEntity(InventoryItemRequestDTO dto, InventoryItemEntity item)
    {
        item.setName(dto.getName());
        item.setCategory(dto.getCategory());
        item.setDescription(dto.getDescription());
        item.setPrice(dto.getPrice());
        item.setQuantity(dto.getQuantity());
        item.setAvailable(dto.getAvailable() != null ? dto.getAvailable() : true);
        item.setImageUrl(dto.getImageUrl());
    }

    private void publishEvent(InventoryChangedEvent event) {
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE_NAME,
                RabbitMQConfig.ROUTING_KEY,
                event
        );
        System.out.println("[Inventory] Published event: " + event.getChangeType()
                + " - item #" + event.getItemId() + " (" + event.getItemName() + ")");
    }

    private InventoryItemResponseDTO toResponseDTO(InventoryItemEntity item)
    {
        return new InventoryItemResponseDTO(
            item.getId(),
            item.getName(),
            item.getCategory(),
            item.getDescription(),
            item.getPrice(),
            item.getQuantity(),
            item.getAvailable(),
            item.getImageUrl()
        );
    }
}
