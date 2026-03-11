package com.example.bank_account.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transaction_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionHistory {
    @Id
    @GeneratedValue
    private Long id;

    private Long cardId;

    private Long userId;

    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    private TransactionType type;
    // PAYMENT
    // TOP_UP
    // TRANSFER

    @Enumerated(EnumType.STRING)
    private TransactionDirection direction; // IN / OUT

    @Column
    private Long relatedCardId; // для перевода

    private LocalDateTime createdAt;
}
