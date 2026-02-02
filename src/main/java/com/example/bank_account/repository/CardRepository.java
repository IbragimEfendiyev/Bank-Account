package com.example.bank_account.repository;

import com.example.bank_account.entity.Card;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CardRepository extends JpaRepository<Card, Long> {
    long countByOwnerId(Long ownerId);
    List<Card> findByOwnerIdOrderByCreatedAtDesc(Long ownerId);

    Optional<Card> findByIdAndOwnerId(Long id, Long ownerId);
    Optional<Card> findByCardNumber(String cardNumber);
    boolean existsByCardNumber(String cardNumber);

    Optional<Card> findByIdAndDeletedFalse(Long id);

    List<Card> findAllByDeletedFalse();
    Optional<Card> findByIdAndOwnerIdAndDeletedFalse(Long id, Long ownerId);

    Optional<Card> findByCardNumberAndDeletedFalse(String cardNumber);
}

