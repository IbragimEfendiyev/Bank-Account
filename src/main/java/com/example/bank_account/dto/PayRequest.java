package com.example.bank_account.dto;

import java.math.BigDecimal;

public class PayRequest {
    private BigDecimal amount;

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
}