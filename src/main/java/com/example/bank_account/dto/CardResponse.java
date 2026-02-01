package com.example.bank_account.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
public class CardResponse {
    private Long id;
    private String cardNumber;
    private LocalDate expireDate;
    private BigDecimal balance;
}

