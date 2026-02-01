package com.example.bank_account.controller;


import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class TestController {

    @GetMapping("/me")
    public Map<String, Object> me(Authentication authentication) {
        return Map.of(
                "principal", authentication.getPrincipal(),   // обычно username
                "authorities", authentication.getAuthorities() // ROLE_USER / ROLE_ADMIN
        );
    }
}

