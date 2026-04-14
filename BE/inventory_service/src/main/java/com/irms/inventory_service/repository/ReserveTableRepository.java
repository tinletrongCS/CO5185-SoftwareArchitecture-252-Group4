package com.irms.inventory_service.repository;

import com.irms.inventory_service.entity.ReservationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReserveTableRepository extends JpaRepository<ReservationEntity, Long> {

    List<ReservationEntity> findByAvailableTrue();

    List<ReservationEntity> findByCategory(String category);

    List<ReservationEntity> findByZone(String zone);

    List<ReservationEntity> findByAvailableTrueAndCategory(String category);

    List<ReservationEntity> findByAvailableTrueAndZone(String zone);
}
