package com.irms.ordering_service.repository;

import com.irms.ordering_service.entity.OrderEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<OrderEntity, Long> {

    @Query("SELECT DISTINCT o FROM OrderEntity o LEFT JOIN FETCH o.items")
    List<OrderEntity> findAllWithItems();

    @Query("SELECT o FROM OrderEntity o LEFT JOIN FETCH o.items WHERE o.id = :id")
    Optional<OrderEntity> findByIdWithItems(@Param("id") Long id);

    List<OrderEntity> findByStatus(String status);

    List<OrderEntity> findByUserName(String userName);

    List<OrderEntity> findByTableId(String tableId);

    @Query("SELECT o FROM OrderEntity o WHERE o.tableId = :tableId AND o.status = :status")
    List<OrderEntity> findByTableIdAndStatus(@Param("tableId") String tableId, @Param("status") String status);

    @Query("SELECT COUNT(o) FROM OrderEntity o WHERE o.status = :status")
    long countByStatus(@Param("status") String status);
}
