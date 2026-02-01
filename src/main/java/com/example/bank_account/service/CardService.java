package com.example.bank_account.service;

import com.example.bank_account.card.CardGenerator;
import com.example.bank_account.dto.CardResponse;
import com.example.bank_account.dto.TransferRequest;
import com.example.bank_account.entity.Card;
import com.example.bank_account.entity.User;
import com.example.bank_account.repository.CardRepository;
import com.example.bank_account.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CardService {

    private final CardRepository cardRepository;
    private final UserRepository userRepository;

    @Transactional
    public List<CardResponse> myCards(Long ownerId) {
        return cardRepository.findByOwnerIdOrderByCreatedAtDesc(ownerId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public CardResponse orderCard(Long ownerId) {
        long count = cardRepository.countByOwnerId(ownerId);
        if (count >= 3) {
            throw new IllegalStateException("Максимум 3 карты на пользователя");
        }

        User user = userRepository.findById(ownerId)
                .orElseThrow(() -> new IllegalStateException("Пользователь не найден"));

        String cardNumber;
        do {
            cardNumber = CardGenerator.generatePan16();
        } while (cardRepository.existsByCardNumber(cardNumber));

        Card card = new Card();
        card.setOwner(user);
        card.setCardNumber(cardNumber);
        card.setExpireDate(CardGenerator.generateExpiry3Years()); // должно вернуть LocalDate
        card.setCvv(CardGenerator.generateCvv());
        card.setBalance(BigDecimal.ZERO);

        Card saved = cardRepository.save(card);
        return toDto(saved);
    }

    @Transactional
    public CardResponse topUp(Long ownerId, Long cardId, BigDecimal amount) {

        // 1) Проверка суммы
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Сумма должна быть больше 0");
        }


        // 2) Ищем карту, но сразу проверяем что она принадлежит ownerId
        Card card = cardRepository.findByIdAndOwnerId(cardId, ownerId)
                .orElseThrow(() -> new IllegalStateException("Карта не найдена или не ваша"));

        // 3) Берём старый баланс
        BigDecimal oldBalance = card.getBalance();
        if (oldBalance == null) oldBalance = BigDecimal.ZERO;

        // 4) Новый баланс = старый + amount
        BigDecimal newBalance = oldBalance.add(amount);
        card.setBalance(newBalance);

        // 5) Сохраняем
        Card saved = cardRepository.save(card);

        // 6) Возвращаем DTO
        return toDto(saved);

    }

    @Transactional
    public void transfer(Long ownerId, TransferRequest req) {

        if (req.amount() == null || req.amount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Сумма должна быть больше 0");
        }
        if (req.fromCardId() == null) {
            throw new IllegalArgumentException("fromCardId обязателен");
        }
        if (req.toCardNumber() == null || req.toCardNumber().isBlank()) {
            throw new IllegalArgumentException("toCardNumber обязателен");
        }

        // 1) источник — только твоя карта
        Card from = cardRepository.findByIdAndOwnerId(req.fromCardId(), ownerId)
                .orElseThrow(() -> new IllegalStateException("Карта списания не найдена или не ваша"));

        // 2) получатель — любая карта
        Card to = cardRepository.findByCardNumber(req.toCardNumber())
                .orElseThrow(() -> new IllegalStateException("Карта получателя не найдена"));

        // (опционально) запрет перевода на ту же карту
        if (from.getId().equals(to.getId())) {
            throw new IllegalArgumentException("Нельзя перевести на ту же карту");
        }

        BigDecimal fromBalance = from.getBalance() == null ? BigDecimal.ZERO : from.getBalance();
        if (fromBalance.compareTo(req.amount()) < 0) {
            throw new IllegalStateException("Недостаточно средств");
        }

        // 3) меняем балансы
        from.setBalance(fromBalance.subtract(req.amount()));

        BigDecimal toBalance = to.getBalance() == null ? BigDecimal.ZERO : to.getBalance();
        to.setBalance(toBalance.add(req.amount()));

        // 4) сохраняем
        cardRepository.save(from);
        cardRepository.save(to);
    }




    private CardResponse toDto(Card card) {
        String number = card.getCardNumber();
        String masked = "**** **** **** " + number.substring(12);

        return new CardResponse(
                card.getId(),
                masked,
                card.getExpireDate(),
                card.getBalance()
        );
    }
}
