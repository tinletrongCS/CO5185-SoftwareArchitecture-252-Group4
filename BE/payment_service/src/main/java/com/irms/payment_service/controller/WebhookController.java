package com.irms.payment_service.controller;

import com.irms.payment_service.dto.SepayWebhookPayloadDTO;
import com.irms.payment_service.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/webhook")
@RequiredArgsConstructor
public class WebhookController {

    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<Map<String, Boolean>> receiveWebhook(@RequestBody SepayWebhookPayloadDTO payload) {
        paymentService.processWebhook(payload);
        return ResponseEntity.status(201).body(Map.of("success", true));
    }
}
