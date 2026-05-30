package com.smartjar.repository;

import com.smartjar.entity.UpiAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UpiAccountRepository extends JpaRepository<UpiAccount, UUID> {
    Optional<UpiAccount> findByUpiId(String upiId);
}
