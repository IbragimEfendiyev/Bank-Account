package com.example.bank_account.repository;

import com.example.bank_account.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {


    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
}
