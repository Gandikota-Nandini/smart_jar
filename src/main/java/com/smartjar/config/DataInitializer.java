package com.smartjar.config;

import com.smartjar.entity.UpiAccount;
import com.smartjar.repository.UpiAccountRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.UUID;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initUpiAccounts(UpiAccountRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                // Seeding Assignment Data as per Rubric
                UpiAccount rahul = new UpiAccount();
                rahul.setUpiId("rahul@upi");
                rahul.setAccountHolderName("Rahul Sharma");
                rahul.setBankName("State Bank");
                rahul.setActive(true);
                repository.save(rahul);

                UpiAccount anita = new UpiAccount();
                anita.setUpiId("anita@ybl");
                anita.setAccountHolderName("Anita Gupta");
                anita.setBankName("Yes Bank");
                anita.setActive(true);
                repository.save(anita);

                System.out.println(">>> NPCI UPI Simulation Data Seeded Successfully.");
            }
        };
    }
}
