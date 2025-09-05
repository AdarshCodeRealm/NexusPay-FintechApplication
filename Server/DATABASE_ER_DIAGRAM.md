# 🗄️ DATABASE ER DIAGRAM & SCHEMA VISUALIZATION

## 📊 **ENTITY RELATIONSHIP DIAGRAM**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FINTECH DATABASE SCHEMA                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐│
│  │     USERS       │◄────────┤   TRANSACTIONS   ├────────►│   BENEFICIARIES ││
│  │                 │         │                  │         │                 ││
│  │ PK: id          │         │ PK: id           │         │ PK: id          ││
│  │ UK: email       │         │ FK: userId       │         │ FK: userId      ││
│  │ UK: username    │         │ FK: recipientId  │         │                 ││
│  │ UK: phone       │         │                  │         │                 ││
│  │ walletBalance   │         │ type (22 types)  │         │ accountNumber   ││
│  │ role            │         │ amount           │         │ ifscCode        ││
│  │ kycStatus       │         │ status           │         │ bankName        ││
│  │ commissionRate  │         │ referenceId      │         │ isVerified      ││
│  │ parentDistId    │─┐       │ serviceProvider  │         │                 ││
│  └─────────────────┘ │       │ serviceNumber    │         └─────────────────┘│
│           │           │       │ billAmount       │                           │
│           │           │       │ dueDate          │                           │
│           │           │       └──────────────────┘                           │
│           │           │                                                      │
│           │           └──────────────────┐                                   │
│           │                              ▼                                   │
│           │              ┌─────────────────────────┐                         │
│           │              │    SELF REFERENCE       │                         │
│           │              │  (Distributor-Retailer) │                         │
│           │              └─────────────────────────┘                         │
│           │                                                                  │
│           ▼                                                                  │
│  ┌─────────────────┐                                                         │
│  │    PAYMENTS     │                                                         │
│  │                 │                                                         │
│  │ PK: id          │                                                         │
│  │ UK: transId     │                                                         │
│  │ FK: userId      │                                                         │
│  │ amount          │                                                         │
│  │ status          │                                                         │
│  │ paymentMethod   │                                                         │
│  │ gatewayResponse │                                                         │
│  │ refundAmount    │                                                         │
│  └─────────────────┘                                                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 🔗 **RELATIONSHIP DETAILS**

### **1. USERS ↔ TRANSACTIONS (One-to-Many)**
```sql
users.id ←→ transactions.userId
users.id ←→ transactions.recipientId (for transfers)
```

### **2. USERS ↔ PAYMENTS (One-to-Many)**
```sql
users.id ←→ payments.userId
```

### **3. USERS ↔ BENEFICIARIES (One-to-Many)**
```sql
users.id ←→ beneficiaries.userId
```

### **4. USERS ↔ USERS (Self-Reference)**
```sql
users.id ←→ users.parentDistributorId (Distributor-Retailer hierarchy)
```

## 📋 **DATA FLOW ARCHITECTURE**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            FINTECH SYSTEM FLOW                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐   │
│  │   CLIENT    │────│   ROUTES    │────│ CONTROLLERS │────│   MODELS    │   │
│  │ (Frontend)  │    │ (Express)   │    │ (Business)  │    │ (Sequelize) │   │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘   │
│         │                    │                   │                  │       │
│         │                    │                   │                  │       │
│         ▼                    ▼                   ▼                  ▼       │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐   │
│  │ USER ACTIONS│    │ MIDDLEWARE  │    │  SERVICES   │    │  DATABASE   │   │
│  │             │    │ (Auth, CORS)│    │ (Payment,   │    │  (MySQL)    │   │
│  │ - Login     │    │             │    │  Wallet)    │    │             │   │
│  │ - Payment   │    │             │    │             │    │             │   │
│  │ - Transfer  │    │             │    │             │    │             │   │
│  │ - Recharge  │    │             │    │             │    │             │   │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 💳 **PAYMENT GATEWAY INTEGRATION FLOW**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PHONEPE PAYMENT FLOW                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐   │
│  │    USER     │    │  FRONTEND   │    │   BACKEND   │    │   PHONEPE   │   │
│  │             │    │             │    │             │    │   GATEWAY   │   │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘   │
│         │                    │                   │                  │       │
│         │ 1. Click Pay       │                   │                  │       │
│         ├───────────────────►│                   │                  │       │
│         │                    │ 2. Initiate       │                  │       │
│         │                    ├──────────────────►│                  │       │
│         │                    │                   │ 3. Create Payment│       │
│         │                    │                   ├─────────────────►│       │
│         │                    │                   │ 4. Payment URL   │       │
│         │                    │ 5. Redirect URL   │◄─────────────────┤       │
│         │ 6. Payment Page    │◄──────────────────┤                  │       │
│         │◄───────────────────┤                   │                  │       │
│         │                    │                   │                  │       │
│         │ 7. Enter Details   │                   │                  │       │
│         ├───────────────────►│                   │                  │       │
│         │                    │                   │                  │       │
│         │                    │                   │ 8. Callback      │       │
│         │                    │                   │◄─────────────────┤       │
│         │                    │                   │ 9. Verify Status │       │
│         │                    │                   ├─────────────────►│       │
│         │                    │                   │ 10. Status       │       │
│         │                    │ 11. Success Page  │◄─────────────────┤       │
│         │ 12. Success        │◄──────────────────┤                  │       │
│         │◄───────────────────┤                   │                  │       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 🏗️ **MICROSERVICES ARCHITECTURE**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        FINTECH MICROSERVICES                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │  AUTH SERVICE   │  │ WALLET SERVICE  │  │ PAYMENT SERVICE │             │
│  │                 │  │                 │  │                 │             │
│  │ - Registration  │  │ - Balance Mgmt  │  │ - Gateway Integ │             │
│  │ - Login/Logout  │  │ - Transfers     │  │ - Status Check  │             │
│  │ - OTP Verify    │  │ - Withdrawals   │  │ - Webhooks      │             │
│  │ - JWT Tokens    │  │ - History       │  │ - Refunds       │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│           │                     │                     │                     │
│           └─────────────────────┼─────────────────────┘                     │
│                                 │                                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │  USER SERVICE   │  │RECHARGE SERVICE │  │  BILL SERVICE   │             │
│  │                 │  │                 │  │                 │             │
│  │ - Profile Mgmt  │  │ - Mobile        │  │ - Credit Cards  │             │
│  │ - KYC Handling  │  │ - DTH           │  │ - Utilities     │             │
│  │ - Beneficiaries │  │ - Data Cards    │  │ - Insurance     │             │
│  │ - Role Mgmt     │  │ - Operators     │  │ - Education     │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 🔐 **SECURITY LAYERS**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SECURITY ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        APPLICATION LAYER                            │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │   │
│  │  │INPUT VALID  │  │RATE LIMITING│  │ENCRYPTION   │  │AUDIT LOGS   │ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                     │                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                       AUTHENTICATION LAYER                         │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │   │
│  │  │JWT TOKENS   │  │OTP VERIFY   │  │REFRESH TOK  │  │ROLE BASED   │ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                     │                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        DATABASE LAYER                              │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │   │
│  │  │ENCRYPTED PWD│  │SQL INJECTION│  │TRANSACTIONS │  │BACKUP/RECOV │ │   │
│  │  │PROTECTION   │  │PREVENTION   │  │ATOMICITY    │  │ERY STRATEGY │ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 📊 **PERFORMANCE OPTIMIZATION**

### **Database Indexes:**
```sql
-- Primary performance indexes
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_transactions_user_date ON transactions(userId, createdAt);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_user ON payments(userId);
```

### **Query Optimization:**
- Pagination for large datasets
- Eager loading for related data
- Connection pooling for database
- Caching for frequently accessed data

### **API Response Times:**
- Target: < 200ms for wallet operations
- Target: < 500ms for payment initiation
- Target: < 100ms for balance checks
- Target: < 300ms for transaction history

## 🚀 **DEPLOYMENT ARCHITECTURE**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DEPLOYMENT STRATEGY                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │   FRONTEND      │    │    BACKEND      │    │    DATABASE     │         │
│  │   (Vercel)      │    │   (Vercel)      │    │    (Cloud)      │         │
│  │                 │    │                 │    │                 │         │
│  │ - React App     │    │ - Node.js API   │    │ - MySQL/PgSQL   │         │
│  │ - Static Files  │    │ - Express Server│    │ - Automated     │         │
│  │ - CDN Cached    │    │ - Serverless    │    │   Backups       │         │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘         │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      MONITORING & LOGGING                          │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │   │
│  │  │ERROR TRACK  │  │PERFORMANCE  │  │UPTIME MON   │  │ALERT SYSTEM │ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```