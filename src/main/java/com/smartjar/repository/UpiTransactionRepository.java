package com.smartjar.repository;

import com.smartjar.entity.UpiTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface UpiTransactionRepository extends JpaRepository<UpiTransaction, UUID> {
}
