package com.irms.inventory_service.service;

import com.irms.inventory_service.dto.ReserveTableRequestDTO;
import com.irms.inventory_service.dto.ReserveTableResponseDTO;

import java.util.List;

public interface ReserveTableService {

    /**
     * Lấy tất cả bàn
     */
    List<ReserveTableResponseDTO> getAllTables();

    /**
     * Lấy danh sách bàn còn trống
     */
    List<ReserveTableResponseDTO> getAvailableTables();

    /**
     * Lấy 1 bàn theo ID
     */
    ReserveTableResponseDTO getTableById(Long id);

    /**
     * Thêm bàn mới (admin)
     */
    ReserveTableResponseDTO createTable(ReserveTableRequestDTO dto);

    /**
     * Cập nhật thông tin bàn (admin)
     */
    ReserveTableResponseDTO updateTable(Long id, ReserveTableRequestDTO dto);

    /**
     * Xóa bàn (admin)
     */
    void deleteTable(Long id);

    /**
     * Cập nhật trạng thái bàn (available/occupied)
     * Gọi khi tạo đơn (false) hoặc hoàn tất/hủy đơn (true)
     */
    ReserveTableResponseDTO updateTableStatus(Long id, boolean available);
}
