package com.smartjar.controller;

import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class AnalyticsController {

    private final com.smartjar.repository.TransactionRepository txRepo;
    private final com.smartjar.repository.UserRepository userRepo;
    private final com.smartjar.service.EmailService emailService;

    public AnalyticsController(com.smartjar.repository.TransactionRepository txRepo, com.smartjar.repository.UserRepository userRepo, com.smartjar.service.EmailService emailService) {
        this.txRepo = txRepo;
        this.userRepo = userRepo;
        this.emailService = emailService;
    }
    @GetMapping("/monthly-spending")
    public Map<String, Object> getMonthlySpending() {
        Map<String, Object> res = new HashMap<>();
        res.put("month", "October");
        res.put("totalSpent", 12000);
        return res;
    }

    @GetMapping("/category-breakdown")
    public Map<String, Integer> getCategoryBreakdown() {
        Map<String, Integer> res = new HashMap<>();
        res.put("food", 4500);
        res.put("shopping", 3000);
        res.put("transport", 1500);
        res.put("bills", 3000);
        return res;
    }

    @GetMapping("/savings-stats")
    public Map<String, Object> getSavingsStats() {
        Map<String, Object> res = new HashMap<>();
        res.put("totalSaved", 1200);
        res.put("growthPercent", 12.5);
        return res;
    }

    @PostMapping("/report/{userId}")
    public Map<String, String> generateAndEmailReport(@PathVariable java.util.UUID userId) {
        com.smartjar.entity.User user = userRepo.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        java.util.List<com.smartjar.entity.Transaction> txs = txRepo.findAll().stream()
            .filter(t -> t.getSenderId().equals(userId) || t.getReceiverId().equals(userId))
            .sorted(java.util.Comparator.comparing(com.smartjar.entity.Transaction::getCreatedAt).reversed())
            .toList();

        StringBuilder sb = new StringBuilder();
        sb.append("SmartJar Financial Ledger Report\n");
        sb.append("---------------------------------------------------\n");
        sb.append(String.format("%-20s | %-15s | %-10s\n", "Date", "Type", "Amount"));
        sb.append("---------------------------------------------------\n");
        for(com.smartjar.entity.Transaction tx : txs) {
            String sign = tx.getSenderId().equals(userId) ? "-" : "+";
            sb.append(String.format("%-20s | %-15s | %s%s\n", 
                tx.getCreatedAt().toString(), 
                tx.getTransactionType(), 
                sign, tx.getAmount()));
        }
        sb.append("---------------------------------------------------\n");

        emailService.sendReport(user.getEmail(), sb.toString());

        Map<String, String> res = new HashMap<>();
        res.put("status", "SUCCESS");
        res.put("message", "Analysis report dispatched to registered email.");
        return res;
    }
}
