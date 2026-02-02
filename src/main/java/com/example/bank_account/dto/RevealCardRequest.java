package com.example.bank_account.dto;

import jakarta.validation.constraints.NotBlank;

public record RevealCardRequest(
        @NotBlank String password
) {
}
