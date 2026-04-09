package com.irms.inventory_service.service;

import com.irms.inventory_service.dto.InventoryItemRequestDTO;
import com.irms.inventory_service.dto.InventoryItemResponseDTO;

import java.util.List;

public interface InventoryService {

    /**
     * Lấy tất cả items đang available (dùng cho khách hàng xem menu)
     */
    List<InventoryItemResponseDTO> getMenu();

    /**
     * Lấy menu theo category (dùng cho khách hàng lọc theo loại món)
     */
    List<InventoryItemResponseDTO> getMenuByCategory(String category);

    /**
     * Lấy tất cả items (kể cả unavailable, dùng cho admin)
     */
    List<InventoryItemResponseDTO> getAllItems();

    /**
     * Lấy 1 item theo ID
     */
    InventoryItemResponseDTO getItemById(Long id);

    /**
     * Thêm nhiều items cùng lúc (admin)
     */
    List<InventoryItemResponseDTO> createItems(List<InventoryItemRequestDTO> dtos);

    /**
     * Cập nhật thông tin item (admin)
     */
    InventoryItemResponseDTO updateItem(Long id, InventoryItemRequestDTO dto);

    /**
     * Xóa item (admin)
     */
    void deleteItem(Long id);

    /**
     * Cập nhật số lượng (gọi từ ordering-service khi đặt món)
     * Tự động set available=false nếu quantity <= 0
     */
    InventoryItemResponseDTO updateQuantity(Long id, int delta);
}
