package com.smartjar.controller;

import org.springframework.web.bind.annotation.*;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/insights")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class InsightsController {

    private final com.smartjar.repository.TransactionRepository txRepo;

    public InsightsController(com.smartjar.repository.TransactionRepository txRepo) {
        this.txRepo = txRepo;
    }

    @GetMapping("/{userId}")
    public List<String> getInsights(@PathVariable java.util.UUID userId) {
        java.util.List<com.smartjar.entity.Transaction> txs = txRepo.findAll().stream()
            .filter(t -> t.getSenderId() != null && t.getSenderId().equals(userId))
            .toList();

        double totalSpent = txs.stream()
            .filter(t -> !t.getTransactionType().equals("SAVINGS_TRANSFER"))
            .mapToDouble(t -> t.getAmount().doubleValue())
            .sum();

        double totalSaved = txs.stream()
            .filter(t -> t.getTransactionType().equals("SAVINGS_TRANSFER"))
            .mapToDouble(t -> t.getAmount().doubleValue())
            .sum();

        return Arrays.asList(
            String.format("You spent ₹%.2f via automated platforms.", totalSpent),
            String.format("You saved ₹%.2f securely within your SmartJar.", totalSaved)
        );
    }
}
