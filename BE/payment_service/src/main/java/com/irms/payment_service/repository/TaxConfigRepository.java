package com.irms.payment_service.repository;

import com.irms.payment_service.entity.TaxConfigEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaxConfigRepository extends JpaRepository<TaxConfigEntity, Long> {
}
