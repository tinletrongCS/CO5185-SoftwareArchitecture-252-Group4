package com.irms.payment_service.service;

import com.irms.payment_service.dto.InvoiceResponseDTO;
import com.irms.payment_service.dto.SepayWebhookPayloadDTO;
import com.irms.payment_service.dto.TaxConfigDTO;
import com.irms.payment_service.entity.TransactionLogEntity;

import java.math.BigDecimal;
import java.util.List;

public interface PaymentService {

    InvoiceResponseDTO createInvoice(Long orderId);

    TaxConfigDTO getCurrentTaxConfig();

    TaxConfigDTO updateTaxConfig(BigDecimal taxRate, String note, String modifiedBy);

    void processWebhook(SepayWebhookPayloadDTO payload);

    List<TransactionLogEntity> getAllTransactions();

    List<TransactionLogEntity> getTransactionsByOrderId(Long orderId);
}
