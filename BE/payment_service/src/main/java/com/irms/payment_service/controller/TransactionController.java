package com.irms.payment_service.controller;

import com.irms.payment_service.entity.TransactionLogEntity;
import com.irms.payment_service.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final PaymentService paymentService;

    @GetMapping
    public ResponseEntity<List<TransactionLogEntity>> getAllTransactions() {
        return ResponseEntity.ok(paymentService.getAllTransactions());
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<TransactionLogEntity>> getTransactionsByOrderId(@PathVariable Long orderId) {
        return ResponseEntity.ok(paymentService.getTransactionsByOrderId(orderId));
    }
}
