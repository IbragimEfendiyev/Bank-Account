package com.example.bank_account.dto;

import java.math.BigDecimal;

public record TransferRequest (
        Long fromCardId,
        String toCardNumber,
        BigDecimal amount
) {}
