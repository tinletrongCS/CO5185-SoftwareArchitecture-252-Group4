package com.irms.payment_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaxConfigDTO {
    private Long id;
    private BigDecimal taxRate;
    private LocalDateTime effectiveDate;
    private String modifiedBy;
    private LocalDateTime modifiedAt;
    private BigDecimal previousRate;
    private String note;
}
