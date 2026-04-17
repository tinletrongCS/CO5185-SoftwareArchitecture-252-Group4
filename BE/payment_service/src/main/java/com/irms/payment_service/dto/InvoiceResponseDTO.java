package com.irms.payment_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceResponseDTO {
    private Long orderId;
    private String tableId;
    private String userName;
    private Float totalPrice;
    private BigDecimal taxRate;
    private Float taxAmount;
    private Float finalPrice;
    private String qrUrl;
    private List<OrderItemDTO> items;
}
