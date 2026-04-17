package com.irms.payment_service.controller;

import com.irms.payment_service.dto.InvoiceResponseDTO;
import com.irms.payment_service.dto.TaxConfigDTO;
import com.irms.payment_service.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/invoice/{orderId}")
    public ResponseEntity<InvoiceResponseDTO> createInvoice(@PathVariable Long orderId) {
        return ResponseEntity.ok(paymentService.createInvoice(orderId));
    }

    @GetMapping("/tax-config")
    public ResponseEntity<TaxConfigDTO> getCurrentTaxConfig() {
        return ResponseEntity.ok(paymentService.getCurrentTaxConfig());
    }

    @PutMapping("/tax-config")
    public ResponseEntity<TaxConfigDTO> updateTaxConfig(@RequestBody Map<String, Object> body) {
        BigDecimal taxRate = new BigDecimal(body.get("taxRate").toString());
        String note = body.containsKey("note") ? body.get("note").toString() : null;
        String modifiedBy = body.containsKey("modifiedBy") ? body.get("modifiedBy").toString() : "admin";
        
        return ResponseEntity.ok(paymentService.updateTaxConfig(taxRate, note, modifiedBy));
    }
}
