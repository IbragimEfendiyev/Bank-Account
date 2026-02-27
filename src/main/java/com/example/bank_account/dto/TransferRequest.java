package com.example.bank_account.dto;

import java.math.BigDecimal;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record TransferRequest(
        @NotNull Long fromCardId,
        @NotBlank String toCardNumber,
        @NotNull @Positive BigDecimal amount
) {}