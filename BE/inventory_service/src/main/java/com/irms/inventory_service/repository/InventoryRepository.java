package com.irms.inventory_service.repository;

import com.irms.inventory_service.entity.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryRepository extends JpaRepository<InventoryItem, Long> {

    List<InventoryItem> findByCategory(String category);
    List<InventoryItem> findByAvailableTrue();
    List<InventoryItem> findByCategoryAndAvailableTrue(String category);
}
