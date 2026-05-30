# SmartJar: Comprehensive Project Review Guide

This guide provides a detailed technical and logical breakdown of the SmartJar Fintech Platform to help you navigate your project review with confidence.

---

## 1. High-Level Architecture
SmartJar is a **Full-Stack Financial Technology Application** built on a modern **Decoupled Architecture**:
- **Client (Frontend)**: A responsive, high-fidelity Single Page Application (SPA) built with **React** and **Vite**.
- **Server (Backend)**: A robust **Spring Boot** application utilizing a **Service-Repository** design pattern.
- **Database**: **PostgreSQL** for persistent storage of users, wallets, and transactions.
- **Security**: **Stateless Authentication** using **JWT (JSON Web Tokens)** and **BCrypt** hashing.

---

## 2. Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18 | Declarative UI components and state management. |
| **Build Tool** | Vite | Ultra-fast development and optimized production bundling. |
| **Styling** | Tailwind CSS | Modern, utility-first styling for premium aesthetics. |
| **Data Viz** | Recharts | Dynamic financial analytics and balance trends. |
| **Icons** | Lucide React | High-quality, consistent iconography. |
| **Backend** | Spring Boot 3 | Enterprise-grade Java framework for RESTful microservices. |
| **Database** | JPA / Hibernate | Object-Relational Mapping (ORM) for database abstraction. |
| **Security** | Spring Security | Role-based access control and JWT integration. |
| **Utilities** | Lombok | Boilerplate reduction for Java entities and DTOs. |
| **API Docs** | Swagger/OpenAPI | Automated API documentation and testing interface. |

---

## 3. Module-by-Module Breakdown

### A. Authentication & User Security
**Technologies**: Spring Security, JWT, BCrypt, Ephemeral RAM Vault.
- **Logic**: 
    - At registration, passwords are never stored in plaintext; they are hashed using **BCrypt**.
    - During login, the system generates a **JWT token** containing the user's ID, which is sent to the frontend and stored in `localStorage`.
    - **Password Reset**: Uses a **6-digit OTP sequence**. The OTP is stored in an ephemeral `ConcurrentHashMap` (the "Identity Vault") in RAM, ensuring it expires automatically and never touches the disk for maximum security.
    - **Identity Normalization**: All emails are normalized to lowercase on both ends to prevent identity mismatches.

### B. Digital Gold Vault
**Technologies**: MetalPriceAPI, BigDecimal Arithmetic.
- **Logic**: 
    - The system fetches **live gold prices** via a background `RestTemplate` call to a global price API. 
    - **Fractional Investing**: Users can buy gold for as little as ₹1. The system calculates grams to 6 decimal places using `BigDecimal` with `RoundingMode.HALF_UP` to ensure absolute financial precision without rounding errors.
    - **Liquidations**: Users can sell gold back to their internal wallet at the current market rate instantly.

### C. NPCI-Style UPI Simulation
**Technologies**: Service-Repository Pattern, Transaction Reference Tracking.
- **Logic**: 
    - Mimics the real-world UPI ecosystem. We have a registry of `UpiAccount` entities (e.g., `rahul@upi`).
    - **P2P Transfers**: When a user sends money, the system validates the receiver's UPI ID, verifies the sender's MPIN, and performs an atomic balance transfer between wallets.
    - **Persistence**: Every transfer generates a unique **Transaction Reference ID** and is recorded in both the `Transaction` ledger and the dedicated `UpiTransaction` audit log.

### D. Micro-Savings & Automation
**Technologies**: Savings Engine, "Jar" Concepts.
- **Logic**: 
    - **The Jar Concept**: Encourages users to save "spare change." 
    - **Round-up Simulation**: Logic that identifies small change from transactions and "sweeps" it into the Gold Vault.
    - **Automated Investment**: Savings are automatically converted into gold holdings, providing a hedge against inflation.

### E. Financial Analytics Dashboard
**Technologies**: Recharts (AreaChart, PieChart), Lucide.
- **Logic**: 
    - **Data Processing**: The frontend fetches the global transaction history and runs it through a `processCharts` engine.
    - **Balance Trends**: Generates a 7-day visualization of the user's net worth.
    - **Spending profile**: Uses a Doughnut chart to categorize expenses (Investments vs. Payments vs. Utilities) in real-time.

---

## 4. Code Folder Structure Breakdown

### Backend (`src/main/java/com/smartjar`)
1.  `controller/`: The **Entry Points**. Handles HTTP requests and returns JSON.
2.  `service/`: The **Brains**. Contains all business logic (e.g., how money is calculated, how OTPs are verified).
3.  `repository/`: The **Data Access**. Standard JPA interfaces for talking to the database.
4.  `entity/`: The **Blueprints**. Java classes that map exactly to your database tables.
5.  `security/`: The **Shield**. Contains the JWT Filter and the `SecurityConfig` (CORS settings, permissioning).

### Frontend (`src/`)
1.  `pages/`: The **Views**. Large components like `Dashboard.jsx`, `Gold.jsx`, and `Savings.jsx`.
2.  `api/`: The **Messenger**. Contains `axiosConfig.js` which handles tokens and the backend URL.
3.  `components/`: The **Building Blocks**. Reusable pieces like the `Layout`.

---

## 5. Key Highlights to Mention in Review
1.  **Industrial Precision**: I used `BigDecimal` for all money and gold math to avoid the floating-point inaccuracies common with `double`.
2.  **Stateless Security**: The app doesn't use sessions; it's completely stateless, making it scalable and secure.
3.  **Responsive Aesthetics**: The UI is designed with a mobile-first approach using Tailwind's layout engine.
4.  **Simulation Integrity**: The UPI simulator is designed to mimic the NPCI's verification flow (Verify UPI -> Enter MPIN -> Confirm Transfer).

---
