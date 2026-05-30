package com.smartjar.service;

import com.smartjar.dto.UpiPaymentRequest;
import com.smartjar.entity.*;
import com.smartjar.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class UpiService {

    private final UpiRepository upiRepo;
    private final UserRepository userRepo;
    private final WalletRepository walletRepo;
    private final TransactionRepository txRepo;
    private final SavingsRepository savingsRepo;
    private final GoldHoldingRepository goldRepo;
    private final UserSecurityRepository secRepo;
    private final PasswordEncoder passwordEncoder;
    private final UpiAccountRepository upiAccountRepo;
    private final UpiTransactionRepository upiTxRepo;

    public UpiService(UpiRepository upiRepo, UserRepository userRepo, WalletRepository walletRepo, TransactionRepository txRepo, SavingsRepository savingsRepo, GoldHoldingRepository goldRepo, UserSecurityRepository secRepo, PasswordEncoder passwordEncoder, UpiAccountRepository upiAccountRepo, UpiTransactionRepository upiTxRepo) {
        this.upiRepo = upiRepo;
        this.userRepo = userRepo;
        this.walletRepo = walletRepo;
        this.txRepo = txRepo;
        this.savingsRepo = savingsRepo;
        this.goldRepo = goldRepo;
        this.secRepo = secRepo;
        this.passwordEncoder = passwordEncoder;
        this.upiAccountRepo = upiAccountRepo;
        this.upiTxRepo = upiTxRepo;
    }

    public Map<String, Object> verifyUpi(String upiId) {
        Map<String, Object> res = new HashMap<>();
        
        // Strict Assignment Regex Pattern Verification
        if (!upiId.matches("^[a-zA-Z0-9.\\-_]{2,256}@[a-zA-Z]{2,64}$")) {
            res.put("valid", false);
            res.put("error", "Invalid UPI ID Format");
            return res;
        }

        // Universal NPCI Simulation Block - Mimicking TPAP Bank Validation
        if (upiId.contains("@") && !(upiId.endsWith("@jar") || upiId.endsWith("@smartjar"))) {
            
            String username = upiId.split("@")[0];
            String bankDomain = upiId.split("@")[1].toLowerCase();

            List<String> validBanks = java.util.Arrays.asList(
                "sbi", "okaxis", "okhdfcbank", "okicici", "ybl", "paytm", "apl", "axl", "ibl", "upi", "kotak", "fam"
            );

            if (!validBanks.contains(bankDomain)) {
                res.put("valid", false);
                res.put("error", "Bank domain @" + bankDomain + " is not registered with NPCI.");
                return res;
            }

            // Generate deterministic realistic Indian name
            String[] surnames = {"Sharma", "Gupta", "Singh", "Patel", "Kumar", "Reddy", "Iyer", "Das", "Rao", "Nair"};
            String mockSurname = surnames[Math.abs(upiId.hashCode()) % surnames.length];
            String displayName = username.length() > 1 ? 
                username.substring(0, 1).toUpperCase() + username.substring(1).replaceAll("[0-9]", "") + " " + mockSurname : 
                "User " + mockSurname;

            res.put("upiId", upiId);
            res.put("status", "VALID_EXTERNAL");
            res.put("valid", true);
            res.put("name", displayName);
            
            return res;
        }

        try {
            // Priority 1: Check the newly added UPI Simulation accounts (Assignment Requirements)
            java.util.Optional<UpiAccount> assignmentUpi = upiAccountRepo.findByUpiId(upiId);
            if (assignmentUpi.isPresent()) {
                res.put("name", assignmentUpi.get().getAccountHolderName());
                res.put("upiId", assignmentUpi.get().getUpiId());
                res.put("status", "VALID_EXTERNAL");
                res.put("valid", true);
                return res;
            }

            // Priority 2: Check internal SmartJar user ledger
            Upi upi = upiRepo.findByUpiId(upiId).orElseThrow(() -> new RuntimeException("UPI ID not found"));
            User user = userRepo.findById(upi.getUserId()).orElseThrow();
            res.put("name", user.getName());
            res.put("upiId", upi.getUpiId());
            res.put("status", "VALID");
            res.put("valid", true);
            return res;
        } catch(Exception e) {
            res.put("valid", false);
            res.put("error", "Invalid UPI ID");
            return res;
        }
    }

    public Map<String, Object> verifyBank(String account, String ifsc) {
        Map<String, Object> res = new HashMap<>();
        res.put("upiId", account + "@" + ifsc);
        res.put("status", "VALID_BANK_EXTERNAL");
        
        // Simulating Bank APIs resolving names
        if (ifsc.startsWith("SBIN")) res.put("name", "SBI Accountholder");
        else if (ifsc.startsWith("HDFC")) res.put("name", "HDFC Accountholder");
        else if (ifsc.startsWith("ICIC")) res.put("name", "ICICI Accountholder");
        else res.put("name", "Verified Bank Recipient");
        
        return res;
    }

    @Transactional
    public Map<String, String> processPayment(UpiPaymentRequest req) {
        Upi senderUpi = upiRepo.findByUpiId(req.getSenderUpi()).orElseThrow(() -> new RuntimeException("Sender UPI invalid"));
        
        // Strict MPIN Architectural Enforcements
        if (req.getMpin() == null || req.getMpin().isEmpty()) {
            throw new RuntimeException("Security Protocol Drop: MPIN requires a valid 6-Digit input block.");
        }
        UserSecurity sec = secRepo.findByUserId(senderUpi.getUserId())
            .orElseThrow(() -> new RuntimeException("MPIN Security Vault Missing. Please configure an MPIN in Settings."));
        if (!passwordEncoder.matches(req.getMpin(), sec.getMpin())) {
            throw new RuntimeException("Cryptographic Error: Invalid 6-Digit MPIN.");
        }
        
        boolean isExternal = req.getReceiverUpi().contains("@") && !(req.getReceiverUpi().endsWith("@jar") || req.getReceiverUpi().endsWith("@smartjar"));
        
        Upi receiverUpi = null;
        if (!isExternal) {
            receiverUpi = upiRepo.findByUpiId(req.getReceiverUpi()).orElseThrow(() -> new RuntimeException("Receiver UPI invalid"));
        }

        if (req.getAmount().compareTo(BigDecimal.ZERO) <= 0) throw new RuntimeException("Invalid amount");

        Wallet senderWallet = walletRepo.findByUserId(senderUpi.getUserId()).orElseThrow();
        
        if (senderWallet.getBalance().compareTo(req.getAmount()) < 0) {
            throw new RuntimeException("Insufficient wallet balance");
        }

        if (req.getAmount().compareTo(BigDecimal.valueOf(50000)) > 0) {
            throw new RuntimeException("Daily limit exceeded");
        }

        // Deduct Sender Globally
        senderWallet.setBalance(senderWallet.getBalance().subtract(req.getAmount()));
        
        // ONLY credit internally if recipient exists in our private ledger
        String receiverNameString;
        if (!isExternal && receiverUpi != null) {
            Wallet receiverWallet = walletRepo.findByUserId(receiverUpi.getUserId()).orElseThrow();
            receiverWallet.setBalance(receiverWallet.getBalance().add(req.getAmount()));
            walletRepo.save(receiverWallet);
            User receiverUser = userRepo.findById(receiverUpi.getUserId()).orElseThrow();
            receiverNameString = receiverUser.getName() + " (" + receiverUpi.getUpiId() + ")";
        } else {
            receiverNameString = "External Entity (" + req.getReceiverUpi() + ")";
        }

        User senderUser = userRepo.findById(senderUpi.getUserId()).orElseThrow();

        Transaction tx = new Transaction();
        tx.setSenderId(senderUpi.getUserId());
        // For external trace routing use null or dummy UUID if schema strictly demands
        tx.setReceiverId(isExternal ? senderUpi.getUserId() : receiverUpi.getUserId()); 
        tx.setAmount(req.getAmount());
        tx.setTransactionType(isExternal ? "EXTERNAL_UPI_TRANSFER" : "P2P_TRANSFER");
        tx.setSenderDetails(senderUser.getName() + " (" + senderUpi.getUpiId() + ")");
        tx.setReceiverDetails(receiverNameString);
        tx.setStatus("SUCCESS");
        txRepo.save(tx);

        // Record for UPI Simulation Simulation Module (Assignment-specific Table)
        UpiTransaction upiTx = new UpiTransaction();
        upiTx.setSenderUpiId(req.getSenderUpi());
        upiTx.setReceiverUpiId(req.getReceiverUpi());
        upiTx.setAmount(req.getAmount());
        upiTx.setStatus("SUCCESS");
        upiTx.setTransactionReference("UPI" + (100000000 + new java.util.Random().nextInt(900000000)));
        upiTxRepo.save(upiTx);

        BigDecimal totalSavingsToExecute = BigDecimal.ZERO;
        
        // Smart Dynamic Tiered Auto-Savings Execution Protocol
        if (req.isApplyRoundUp() || req.isApplyFivePercent()) {
            double amt = req.getAmount().doubleValue();
            if (amt <= 100) {
                // Tier 1: Micro Transaction - Round to nearest 10
                double remainder = amt % 10;
                double save = (remainder == 0) ? 10 : (10 - remainder);
                totalSavingsToExecute = BigDecimal.valueOf(save);
            } else if (amt <= 1000) {
                // Tier 2: Mid Transaction - Round to nearest 50
                double remainder = amt % 50;
                double save = (remainder == 0) ? 50 : (50 - remainder);
                totalSavingsToExecute = BigDecimal.valueOf(save);
            } else {
                // Tier 3: Macro Transaction - Floor 5%
                double save = Math.floor(amt * 0.05);
                totalSavingsToExecute = BigDecimal.valueOf(save);
            }
        }

        if (totalSavingsToExecute.compareTo(BigDecimal.ZERO) > 0 && senderWallet.getBalance().compareTo(totalSavingsToExecute) >= 0) {
            senderWallet.setBalance(senderWallet.getBalance().subtract(totalSavingsToExecute));
            
            // Standard Savings Historical Ledger Record
            Savings savings = new Savings();
            savings.setUserId(senderUpi.getUserId());
            savings.setTransactionId(tx.getId());
            savings.setSavedAmount(totalSavingsToExecute);
            savings.setAssetType("GOLD");
            savingsRepo.save(savings);

            // Directly inject into Global Gold Vault System utilizing 15329.00 requested Default Rate
            BigDecimal livePrice = BigDecimal.valueOf(15329.00);
            BigDecimal grams = totalSavingsToExecute.divide(livePrice, 5, java.math.RoundingMode.HALF_UP);

            GoldHolding holding = new GoldHolding();
            holding.setUserId(senderUpi.getUserId());
            holding.setPurchasePrice(totalSavingsToExecute);
            holding.setGrams(grams);
            holding.setCreatedAt(java.time.LocalDateTime.now());
            goldRepo.save(holding);

            Transaction goldTx = new Transaction();
            goldTx.setSenderId(senderUpi.getUserId());
            goldTx.setReceiverId(senderUpi.getUserId());
            goldTx.setAmount(totalSavingsToExecute);
            goldTx.setTransactionType("GOLD_SAVINGS_SWEEP");
            goldTx.setSenderDetails("Wallet Autopilot");
            goldTx.setReceiverDetails("Digital Gold Vault");
            goldTx.setStatus("SUCCESS");
            txRepo.save(goldTx);
        }

        walletRepo.save(senderWallet);

        Map<String, String> response = new HashMap<>();
        response.put("status", "SUCCESS");
        response.put("transactionId", tx.getId().toString());
        response.put("savingsApplied", totalSavingsToExecute.toString());
        return response;
    }

    public List<Transaction> getHistory(UUID userId) {
        return txRepo.findBySenderIdOrReceiverIdOrderByCreatedAtDesc(userId, userId);
    }
}
