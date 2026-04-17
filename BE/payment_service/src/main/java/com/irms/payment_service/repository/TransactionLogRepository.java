package com.irms.payment_service.repository;

import com.irms.payment_service.entity.TransactionLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TransactionLogRepository extends JpaRepository<TransactionLogEntity, Long> {
    Optional<TransactionLogEntity> findBySepayTransactionId(Long sepayTransactionId);
}
