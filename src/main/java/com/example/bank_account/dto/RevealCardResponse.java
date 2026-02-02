package com.example.bank_account.dto;


import java.time.LocalDate;

public record RevealCardResponse(
        Long cardId,
        String cardNumber,
        LocalDate expireDate,
        String cvv
) {}

