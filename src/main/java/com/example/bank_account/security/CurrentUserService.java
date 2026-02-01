package com.example.bank_account.security;

import com.example.bank_account.entity.User;
import com.example.bank_account.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CurrentUserService {

    private final UserRepository userRepository;

    public User requireUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated()) {
            throw new IllegalStateException("Пользователь не авторизован");
        }

        String username = auth.getName(); // username из JWT (subject)

        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalStateException("Пользователь не найден"));
    }
}

