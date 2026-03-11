package com.example.bank_account.service;

import com.example.bank_account.card.CardGenerator;
import com.example.bank_account.dto.CardResponse;
import com.example.bank_account.dto.RevealCardResponse;
import com.example.bank_account.dto.TransferRequest;
import com.example.bank_account.entity.*;
import com.example.bank_account.repository.CardRepository;
import com.example.bank_account.repository.TransactionHistoryRepository;
import com.example.bank_account.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CardService {

    private final CardRepository cardRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TransactionHistoryRepository transactionHistoryRepository;

    private void ensureCanDoMoneyOperation(Card card, String prefix) {
        if (card.isDeleted()) {
            throw new IllegalStateException(prefix + ": карта удалена");
        }
        if (card.getStatus() == CardStatus.BLOCKED) {
            throw new IllegalStateException(prefix + ": карта заблокирована");
        }

    }

    private void ensureCardExistsBasics(Card card) {
        if (card.getBalance() == null) card.setBalance(BigDecimal.ZERO);
    }


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

        Card card = cardRepository.findByIdAndOwnerIdAndDeletedFalse(cardId, ownerId)
                .orElseThrow(() -> new IllegalStateException("Карта не найдена или не ваша"));

        ensureCanDoMoneyOperation(card, "Пополнение");
        // 1) Проверка суммы
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Сумма должна быть больше 0");
        }

        // 3) Берём старый баланс
        BigDecimal oldBalance = card.getBalance();
        if (oldBalance == null) oldBalance = BigDecimal.ZERO;

        // 4) Новый баланс = старый + amount
        BigDecimal newBalance = oldBalance.add(amount);
        card.setBalance(newBalance);

        // 5) Сохраняем
        Card saved = cardRepository.save(card);

        TransactionHistory history = new TransactionHistory();
        history.setCardId(card.getId());
        history.setUserId(ownerId);
        history.setAmount(amount);
        history.setType(TransactionType.TOP_UP);
        history.setDirection(TransactionDirection.IN);
        history.setCreatedAt(java.time.LocalDateTime.now());

        transactionHistoryRepository.save(history);

        // 6) Возвращаем DTO
        return toDto(saved);

    }

    @Transactional
    public void transfer(Long ownerId, TransferRequest req) {

        Card from = cardRepository.findByIdAndOwnerIdAndDeletedFalse(req.fromCardId(), ownerId)
                .orElseThrow(() -> new IllegalStateException("Карта списания не найдена или не ваша"));

        ensureCanDoMoneyOperation(from, "Перевод (списание)");

        Card to = cardRepository.findByCardNumberAndDeletedFalse(req.toCardNumber())
                .orElseThrow(() -> new IllegalStateException("Карта получателя не найдена"));

        ensureCanDoMoneyOperation(to, "Перевод (получатель)");

        if (from.getId().equals(to.getId())) {
            throw new IllegalArgumentException("Нельзя перевести на ту же карту");
        }

        BigDecimal fromBalance = from.getBalance() == null ? BigDecimal.ZERO : from.getBalance();
        if (fromBalance.compareTo(req.amount()) < 0) {
            throw new IllegalStateException("Недостаточно средств");
        }

        from.setBalance(fromBalance.subtract(req.amount()));

        BigDecimal toBalance = to.getBalance() == null ? BigDecimal.ZERO : to.getBalance();
        to.setBalance(toBalance.add(req.amount()));

        cardRepository.save(from);
        cardRepository.save(to);

        // История для отправителя
        TransactionHistory historyFrom = new TransactionHistory();
        historyFrom.setCardId(from.getId());
        historyFrom.setUserId(ownerId);
        historyFrom.setAmount(req.amount());
        historyFrom.setType(TransactionType.TRANSFER);
        historyFrom.setDirection(TransactionDirection.OUT);  // ← исходящий
        historyFrom.setRelatedCardId(to.getId());
        historyFrom.setCreatedAt(java.time.LocalDateTime.now());

        transactionHistoryRepository.save(historyFrom);

        // История для получателя
        TransactionHistory historyTo = new TransactionHistory();
        historyTo.setCardId(to.getId());
        historyTo.setUserId(to.getOwner().getId());
        historyTo.setAmount(req.amount());
        historyTo.setType(TransactionType.TRANSFER);
        historyTo.setDirection(TransactionDirection.IN);  // ← входящий
        historyTo.setRelatedCardId(from.getId());
        historyTo.setCreatedAt(java.time.LocalDateTime.now());

        transactionHistoryRepository.save(historyTo);
    }

    @Transactional
    public CardResponse pay(Long cardId, BigDecimal amount, Long ownerId) {

        Card card = cardRepository
                .findByIdAndOwnerIdAndDeletedFalse(cardId, ownerId)
                .orElseThrow(() -> new IllegalStateException("Карта не найдена"));

        ensureCanDoMoneyOperation(card, "Оплата");

        BigDecimal balance = Optional.ofNullable(card.getBalance())
                .orElse(BigDecimal.ZERO);

        if (balance.compareTo(amount) < 0)
            throw new IllegalStateException("Недостаточно средств");

        card.setBalance(balance.subtract(amount));

        // === СОЗДАЁМ ИСТОРИЮ ===
        TransactionHistory history = new TransactionHistory();
        history.setCardId(card.getId());
        history.setUserId(ownerId);
        history.setAmount(amount);
        history.setType(TransactionType.PAYMENT);
        history.setDirection(TransactionDirection.OUT);
        history.setCreatedAt(LocalDateTime.now());

        transactionHistoryRepository.save(history);

        return new CardResponse(
                card.getId(),
                card.getBalance()
        );
    }

    @Transactional
    public RevealCardResponse revealCard(Long ownerId, Long cardId, String rawPassword) {

        if (rawPassword == null || rawPassword.isBlank()) {
            throw new IllegalArgumentException("Пароль обязателен");
        }

        // 1) Берём пользователя
        User user = userRepository.findById(ownerId)
                .orElseThrow(() -> new IllegalStateException("Пользователь не найден"));

        // 2) Проверяем пароль (raw vs hash)
        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new IllegalStateException("Неверный пароль");
        }

        // 3) Берём карту ТОЛЬКО этого пользователя
        Card card = cardRepository.findByIdAndOwnerId(cardId, ownerId)
                .orElseThrow(() -> new IllegalStateException("Карта не найдена или не ваша"));

        // 4) Возвращаем полные данные
        return new RevealCardResponse(
                card.getId(),
                card.getCardNumber(),
                card.getExpireDate(),
                card.getCvv()
        );
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

    public List<TransactionHistory> getCardHistory(
            Long cardId,
            Long userId) {

        return transactionHistoryRepository
                .findByCardIdAndUserIdOrderByCreatedAtDesc(
                        cardId,
                        userId
                );
    }
}
