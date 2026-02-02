package com.example.bank_account.dto;

import com.example.bank_account.entity.Card;
import com.example.bank_account.entity.CardStatus;

import java.math.BigDecimal;

public record CardAdminDto(
        Long id,
        String ownerUsername,
        String maskedNumber,
        CardStatus status,
        BigDecimal balance
) {
    public static CardAdminDto from(Card c) {
        String num = c.getCardNumber();
        String masked = (num != null && num.length() >= 16)
                ? "**** **** **** " + num.substring(12)
                : "****";
        return new CardAdminDto(
                c.getId(),
                c.getOwner().getUsername(),
                masked,
                c.getStatus(),
                c.getBalance()
        );
    }
}

