package com.irms.payment_service.repository;

import com.irms.payment_service.entity.PaymentRecordEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentRecordRepository extends JpaRepository<PaymentRecordEntity, Long> {
    Optional<PaymentRecordEntity> findByOrderId(Long orderId);
}
