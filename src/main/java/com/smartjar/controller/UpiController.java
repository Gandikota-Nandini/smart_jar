package com.smartjar.controller;

import com.smartjar.dto.UpiPaymentRequest;
import com.smartjar.entity.Transaction;
import com.smartjar.service.UpiService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/upi")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class UpiController {

    private final UpiService upiService;

    public UpiController(UpiService upiService) {
        this.upiService = upiService;
    }

    @GetMapping("/verify/{upiId}")
    public Map<String, Object> verifyUpiPath(@PathVariable String upiId) {
        return upiService.verifyUpi(upiId);
    }

    // Assignment Compliance Alias: Query Param format
    @GetMapping("/verify")
    public Map<String, Object> verifyUpiQuery(@RequestParam String upiId) {
        return upiService.verifyUpi(upiId);
    }

    @GetMapping("/verify/bank")
    public Map<String, Object> verifyBank(@RequestParam String account, @RequestParam String ifsc) {
        return upiService.verifyBank(account, ifsc);
    }

    @PostMapping("/p2p/send")
    public Map<String, String> sendMoney(@RequestBody UpiPaymentRequest request) {
        return upiService.processPayment(request);
    }

    // Assignment Compliance Alias: Pay Endpoint
    @PostMapping("/pay")
    public Map<String, String> payMoney(@RequestBody UpiPaymentRequest request) {
        return upiService.processPayment(request);
    }

    @GetMapping("/history/{userId}")
    public List<Transaction> getHistory(@PathVariable UUID userId) {
        return upiService.getHistory(userId);
    }
}
