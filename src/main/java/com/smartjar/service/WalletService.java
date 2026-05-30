package com.smartjar.service;
import com.smartjar.entity.Wallet;
import com.smartjar.repository.WalletRepository;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.UUID;
@Service
public class WalletService {
    private final WalletRepository walletRepo;
    private final com.smartjar.repository.TransactionRepository txRepo;

    public WalletService(WalletRepository walletRepo, com.smartjar.repository.TransactionRepository txRepo) { 
        this.walletRepo = walletRepo; 
        this.txRepo = txRepo;
    }
    
    public Wallet getWallet(UUID userId) { return walletRepo.findByUserId(userId).orElseThrow(); }
    
    public Wallet addMoney(UUID userId, BigDecimal amount) {
        Wallet w = getWallet(userId);
        w.setBalance(w.getBalance().add(amount));
        walletRepo.save(w);

        com.smartjar.entity.Transaction tx = new com.smartjar.entity.Transaction();
        tx.setSenderId(userId);
        tx.setReceiverId(userId);
        tx.setAmount(amount);
        tx.setTransactionType("WALLET_TOPUP");
        tx.setSenderDetails("Self-Funding / Gateway");
        tx.setReceiverDetails("Internal Wallet");
        tx.setStatus("SUCCESS");
        txRepo.save(tx);

        return w;
    }
}
