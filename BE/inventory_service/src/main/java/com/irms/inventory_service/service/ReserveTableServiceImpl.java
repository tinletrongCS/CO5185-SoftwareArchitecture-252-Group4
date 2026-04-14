package com.irms.inventory_service.service;

import com.irms.inventory_service.dto.ReserveTableRequestDTO;
import com.irms.inventory_service.dto.ReserveTableResponseDTO;
import com.irms.inventory_service.entity.ReservationEntity;
import com.irms.inventory_service.repository.ReserveTableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReserveTableServiceImpl implements ReserveTableService {

    private final ReserveTableRepository reserveTableRepository;

    @Override
    public List<ReserveTableResponseDTO> getAllTables() {
        return reserveTableRepository.findAll()
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Override
    public List<ReserveTableResponseDTO> getAvailableTables() {
        return reserveTableRepository.findByAvailableTrue()
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Override
    public ReserveTableResponseDTO getTableById(Long id) {
        ReservationEntity table = findOrThrow(id);
        return toResponseDTO(table);
    }

    @Override
    public ReserveTableResponseDTO createTable(ReserveTableRequestDTO dto) {
        ReservationEntity table = new ReservationEntity();
        mapDtoToEntity(dto, table);
        ReservationEntity saved = reserveTableRepository.save(table);
        System.out.println("[Table] Đã tạo bàn mới: " + saved.getTableName() + " (ID: " + saved.getId() + ")");
        return toResponseDTO(saved);
    }

    @Override
    public ReserveTableResponseDTO updateTable(Long id, ReserveTableRequestDTO dto) {
        ReservationEntity table = findOrThrow(id);
        mapDtoToEntity(dto, table);
        ReservationEntity updated = reserveTableRepository.save(table);
        System.out.println("[Table] Đã cập nhật bàn: " + updated.getTableName() + " (ID: " + updated.getId() + ")");
        return toResponseDTO(updated);
    }

    @Override
    public void deleteTable(Long id) {
        ReservationEntity table = findOrThrow(id);
        reserveTableRepository.deleteById(id);
        System.out.println("[Table] Đã xóa bàn: " + table.getTableName() + " (ID: " + id + ")");
    }

    @Override
    @Transactional
    public ReserveTableResponseDTO updateTableStatus(Long id, boolean available) {
        ReservationEntity table = findOrThrow(id);
        table.setAvailable(available);
        ReservationEntity updated = reserveTableRepository.save(table);
        System.out.println("[Table] Cập nhật trạng thái bàn #" + id
                + " (" + table.getTableName() + "): " + (available ? "TRỐNG" : "ĐANG SỬ DỤNG"));
        return toResponseDTO(updated);
    }

    // --- Helper methods ---

    private ReservationEntity findOrThrow(Long id) {
        return reserveTableRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bàn với ID: " + id));
    }

    private void mapDtoToEntity(ReserveTableRequestDTO dto, ReservationEntity entity) {
        entity.setTableName(dto.getTableName());
        entity.setCapacity(dto.getCapacity());
        entity.setCategory(dto.getCategory());
        entity.setZone(dto.getZone());
        entity.setPositionX(dto.getPositionX());
        entity.setPositionY(dto.getPositionY());
        entity.setAvailable(dto.getAvailable() != null ? dto.getAvailable() : true);
        entity.setDescription(dto.getDescription());
    }

    private ReserveTableResponseDTO toResponseDTO(ReservationEntity entity) {
        return new ReserveTableResponseDTO(
                entity.getId(),
                entity.getTableName(),
                entity.getCapacity(),
                entity.getCategory(),
                entity.getZone(),
                entity.getPositionX(),
                entity.getPositionY(),
                entity.getAvailable(),
                entity.getDescription()
        );
    }
}
