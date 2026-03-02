package com.example.bank_account.controller;

import com.example.bank_account.dto.*;
import com.example.bank_account.entity.Card;
import com.example.bank_account.entity.User;
import com.example.bank_account.repository.UserRepository;
import com.example.bank_account.security.CurrentUserService;
import com.example.bank_account.service.CardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cards")
@RequiredArgsConstructor
public class CardController {

    private final CardService cardService;
    private final CurrentUserService currentUserService;
    private final UserRepository userRepository;

    @GetMapping
    public List<CardResponse> myCards() {
        User user = currentUserService.requireUser();
        return cardService.myCards(user.getId());
    }

    @PostMapping("/order")
    public CardResponse order() {
        User user = currentUserService.requireUser();
        return cardService.orderCard(user.getId());
    }

    @PostMapping("/{cardId}/top-up")
    public CardResponse topUp(
            @PathVariable Long cardId,
            @RequestBody TopUpRequest request
    ) {
        User user = currentUserService.requireUser();      // ✅ ownerId берём из JWT
        return cardService.topUp(user.getId(), cardId, request.amount());
    }

    @PostMapping("/transfers")
    public void transfer(@RequestBody TransferRequest request) {
        User user = currentUserService.requireUser();
        cardService.transfer(user.getId(), request);
    }

    @PostMapping("/{cardId}/pay")
    public ResponseEntity<CardResponse> pay(
            @PathVariable Long cardId,
            @RequestBody PayRequest request
    ) {
        User user = currentUserService.requireUser();

        CardResponse card = cardService.pay(
                cardId,
                request.getAmount(),
                user.getId()
        );

        return ResponseEntity.ok(card);
    }




    @PostMapping("/{cardId}/reveal")
    public ResponseEntity<RevealCardResponse> reveal(
            @PathVariable Long cardId,
            @Valid @RequestBody RevealCardRequest req,
            Authentication auth
    ) {

        String username = auth.getName();

        Long ownerId = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalStateException("User not found"))
                .getId();


        RevealCardResponse resp = cardService.revealCard(ownerId, cardId, req.password());
        return ResponseEntity.ok(resp);
    }


}
