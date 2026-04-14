package com.irms.inventory_service.repository;

import com.irms.inventory_service.entity.InventoryItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<InventoryItemEntity, Long> {

    List<InventoryItemEntity> findByCategory(String category);
    List<InventoryItemEntity> findByAvailableTrue();
    List<InventoryItemEntity> findByCategoryAndAvailableTrue(String category);
    Optional<InventoryItemEntity> findFirstByName(String name);
}
