package com.irms.ordering_service.repository;

import com.irms.ordering_service.entity.OrderEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<OrderEntity, Long> {

    List<OrderEntity> findByStatus(String status);

    List<OrderEntity> findByTableId(String tableId);

    @Query("SELECT o FROM OrderEntity o WHERE o.tableId = :tableId AND o.status = :status")
    List<OrderEntity> findByTableIdAndStatus(@Param("tableId") String tableId, @Param("status") String status);

    @Query("SELECT COUNT(o) FROM OrderEntity o WHERE o.status = :status")
    long countByStatus(@Param("status") String status);
}
