package com.smartjar.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "upi_transactions")
@Data
public class UpiTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "sender_upi_id")
    private String senderUpiId;

    @Column(name = "receiver_upi_id")
    private String receiverUpiId;

    @Column(name = "amount")
    private BigDecimal amount;

    @Column(name = "status")
    private String status; // SUCCESS / FAILED / PENDING

    @Column(name = "transaction_reference")
    private String transactionReference;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
