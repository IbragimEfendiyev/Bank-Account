package com.example.bank_account.repository;

import com.example.bank_account.entity.TransactionHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransactionHistoryRepository
        extends JpaRepository<TransactionHistory, Long> {

    List<TransactionHistory> findByCardIdAndUserIdOrderByCreatedAtDesc(
            Long cardId,
            Long userId
    );
}
