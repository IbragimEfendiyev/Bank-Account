package com.example.bank_account.controller;

import com.example.bank_account.service.AdminCardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/cards")
@RequiredArgsConstructor
public class AdminCardController {

    private final AdminCardService adminCardService;

    @PatchMapping("/{id}/block")
    public ResponseEntity<?> block(@PathVariable Long id) {
        adminCardService.block(id);
        return ResponseEntity.ok("Card blocked");
    }

    @PatchMapping("/{id}/unblock")
    public ResponseEntity<?> unblock(@PathVariable Long id) {
        adminCardService.unblock(id);
        return ResponseEntity.ok("Card unblocked");
    }

    @PatchMapping("/{id}/close")
    public ResponseEntity<?> close(@PathVariable Long id) {
        adminCardService.close(id);
        return ResponseEntity.ok("Card closed");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        adminCardService.softDelete(id);
        return ResponseEntity.ok("Card deleted (soft)");
    }
}

