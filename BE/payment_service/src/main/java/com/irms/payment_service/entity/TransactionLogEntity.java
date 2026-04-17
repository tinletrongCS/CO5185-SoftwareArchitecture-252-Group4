package com.irms.payment_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "transaction_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionLogEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sepay_transaction_id", unique = true)
    private Long sepayTransactionId;

    @Column(name = "order_id")
    private Long orderId;

    @Column(name = "gateway")
    private String gateway;

    @Column(name = "transaction_date")
    private String transactionDate;

    @Column(name = "account_number")
    private String accountNumber;

    @Column(name = "amount_in")
    private Float amountIn;

    @Column(name = "amount_out")
    private Float amountOut;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "reference_code")
    private String referenceCode;

    @Column(name = "raw_body", columnDefinition = "TEXT")
    private String rawBody;

    @Column(name = "received_at")
    private LocalDateTime receivedAt;
}
