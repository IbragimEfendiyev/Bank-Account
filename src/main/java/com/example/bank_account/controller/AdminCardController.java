package com.example.bank_account.controller;

import com.example.bank_account.dto.CardAdminDto;
import com.example.bank_account.repository.CardRepository;
import com.example.bank_account.service.AdminCardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/cards")
public class AdminCardController {

    private final AdminCardService adminCardService;
    private final CardRepository cardRepository;

    // ✅ список всех карт (без deleted)
    @GetMapping
    public List<CardAdminDto> all() {
        return cardRepository.findAllByDeletedFalse()
                .stream()
                .map(CardAdminDto::from)
                .toList();
    }

    @PatchMapping("/{id}/block")
    public ResponseEntity<?> block(@PathVariable Long id) {
        adminCardService.block(id);
        return ResponseEntity.ok("blocked");
    }

    @PatchMapping("/{id}/unblock")
    public ResponseEntity<?> unblock(@PathVariable Long id) {
        adminCardService.unblock(id);
        return ResponseEntity.ok("unblocked");
    }

//    @PatchMapping("/{id}/close")
//    public ResponseEntity<?> close(@PathVariable Long id) {
//        adminCardService.close(id);
//        return ResponseEntity.ok("closed");
//    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        adminCardService.deleteCard(id);
        return ResponseEntity.ok("deleted");
    }
}

