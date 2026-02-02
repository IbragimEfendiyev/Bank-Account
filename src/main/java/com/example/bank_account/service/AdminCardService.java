package com.example.bank_account.service;

import com.example.bank_account.entity.Card;
import com.example.bank_account.entity.CardStatus;
import com.example.bank_account.repository.CardRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AdminCardService {

    private final CardRepository cardRepository;

    @Transactional
    public void block(Long cardId) {
        Card card = cardRepository.findByIdAndDeletedFalse(cardId)
                .orElseThrow(() -> new IllegalStateException("Card not found"));

        if (card.getStatus() == CardStatus.CLOSED) {
            throw new IllegalStateException("Closed card cannot be blocked");
        }

        card.setStatus(CardStatus.BLOCKED);
        card.setBlockedAt(Instant.now());
    }

    @Transactional
    public void unblock(Long cardId) {
        Card card = cardRepository.findByIdAndDeletedFalse(cardId)
                .orElseThrow(() -> new IllegalStateException("Card not found"));

        if (card.getStatus() == CardStatus.CLOSED) {
            throw new IllegalStateException("Closed card cannot be unblocked");
        }

        card.setStatus(CardStatus.ACTIVE);
        card.setBlockedAt(null); // опционально
    }

    @Transactional
    public void close(Long cardId) {
        Card card = cardRepository.findByIdAndDeletedFalse(cardId)
                .orElseThrow(() -> new IllegalStateException("Card not found"));

        card.setStatus(CardStatus.CLOSED);
        card.setClosedAt(Instant.now());
    }

    @Transactional
    public void softDelete(Long cardId) {
        Card card = cardRepository.findByIdAndDeletedFalse(cardId)
                .orElseThrow(() -> new IllegalStateException("Card not found"));

        // обычно удалять можно только закрытую
        if (card.getStatus() != CardStatus.CLOSED) {
            throw new IllegalStateException("Card must be CLOSED before delete");
        }

        card.setDeleted(true);
    }
}
