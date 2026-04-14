package com.irms.inventory_service.controller;

import com.irms.inventory_service.dto.ReserveTableRequestDTO;
import com.irms.inventory_service.dto.ReserveTableResponseDTO;
import com.irms.inventory_service.service.ReserveTableService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tables")
@RequiredArgsConstructor
public class ReserveTableController {

    private final ReserveTableService reserveTableService;

    // Lấy tất cả bàn (admin)
    @GetMapping
    public ResponseEntity<List<ReserveTableResponseDTO>> getAllTables() {
        return ResponseEntity.ok(reserveTableService.getAllTables());
    }

    // Lấy danh sách bàn còn trống (dùng khi tạo đơn)
    @GetMapping("/available")
    public ResponseEntity<List<ReserveTableResponseDTO>> getAvailableTables() {
        return ResponseEntity.ok(reserveTableService.getAvailableTables());
    }

    // Lấy 1 bàn theo ID
    @GetMapping("/{id}")
    public ResponseEntity<ReserveTableResponseDTO> getTableById(@PathVariable Long id) {
        return ResponseEntity.ok(reserveTableService.getTableById(id));
    }

    // Thêm bàn mới (admin)
    @PostMapping
    public ResponseEntity<ReserveTableResponseDTO> createTable(@RequestBody ReserveTableRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reserveTableService.createTable(dto));
    }

    // Cập nhật thông tin bàn (admin)
    @PutMapping("/{id}")
    public ResponseEntity<ReserveTableResponseDTO> updateTable(@PathVariable Long id,
                                                                @RequestBody ReserveTableRequestDTO dto) {
        return ResponseEntity.ok(reserveTableService.updateTable(id, dto));
    }

    // Xóa bàn (admin)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTable(@PathVariable Long id) {
        reserveTableService.deleteTable(id);
        return ResponseEntity.noContent().build();
    }

    // Cập nhật trạng thái bàn: PUT /tables/{id}/status?available=false
    // Gọi khi tạo đơn (available=false) hoặc hoàn tất/hủy đơn (available=true)
    @PutMapping("/{id}/status")
    public ResponseEntity<ReserveTableResponseDTO> updateTableStatus(@PathVariable Long id,
                                                                      @RequestParam boolean available) {
        return ResponseEntity.ok(reserveTableService.updateTableStatus(id, available));
    }
}
