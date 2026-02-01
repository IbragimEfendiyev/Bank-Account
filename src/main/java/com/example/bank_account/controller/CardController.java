package com.example.bank_account.controller;

import com.example.bank_account.dto.CardResponse;
import com.example.bank_account.dto.TopUpRequest;
import com.example.bank_account.dto.TransferRequest;
import com.example.bank_account.entity.Card;
import com.example.bank_account.entity.User;
import com.example.bank_account.security.CurrentUserService;
import com.example.bank_account.service.CardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cards")
@RequiredArgsConstructor
public class CardController {

    private final CardService cardService;
    private final CurrentUserService currentUserService;

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

    @PostMapping("/api/transfers")
    public void transfer(@RequestBody TransferRequest request) {
        User user = currentUserService.requireUser();
        cardService.transfer(user.getId(), request);
    }


}
