package com.irms.payment_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "tax_config")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaxConfigEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tax_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal taxRate;

    @Column(name = "effective_date")
    private LocalDateTime effectiveDate;

    @Column(name = "modified_by")
    private String modifiedBy;

    @Column(name = "modified_at")
    private LocalDateTime modifiedAt;

    @Column(name = "previous_rate", precision = 5, scale = 2)
    private BigDecimal previousRate;

    @Column(name = "note")
    private String note;
}
