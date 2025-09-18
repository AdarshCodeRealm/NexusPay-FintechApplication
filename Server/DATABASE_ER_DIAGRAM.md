# 🗄️ DATABASE ER DIAGRAM & SCHEMA VISUALIZATION (AWS RDS Production)

## 📊 **ENHANCED ENTITY RELATIONSHIP DIAGRAM**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        NEXASPAY FINTECH DATABASE SCHEMA                     │
│                           (AWS RDS MySQL Production)                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐│
│  │     USERS       │◄────────┤   TRANSACTIONS   ├────────►│   BENEFICIARIES ││
│  │                 │  1:N    │   (ENHANCED)     │  N:1    │                 ││
│  │ PK: id          │         │                  │         │ PK: id          ││
│  │ UK: email       │         │ PK: id           │         │ FK: userId      ││
│  │ UK: username    │         │ FK: userId       │         │                 ││
│  │ UK: phone       │         │ FK: recipientId  │         │ accountNumber   ││
│  │ UK: user_code*  │         │                  │         │ ifscCode        ││
│  │ walletBalance   │         │ CORE FIELDS:     │         │ bankName        ││
│  │ role            │         │ ├─ type (7 types)│         │ beneficiaryName ││
│  │ kycStatus       │         │ ├─ amount        │         │ isVerified      ││
│  │ commissionRate  │         │ ├─ status        │         │ accountType     ││
│  │ parentDistId    │─┐       │ ├─ referenceNum  │         │ relationShip    ││
│  │ user_code*      │ │       │ └─ paymentMethod │         └─────────────────┘│
│  │ daily_limit*    │ │       │                  │                           │
│  │ monthly_limit*  │ │       │ LEDGER FIELDS*:  │                           │
│  └─────────────────┘ │       │ ├─ ledger_date*  │                           │
│           │           │       │ ├─ user_code*    │                           │
│           │           │       │ ├─ ledger_type*  │                           │
│           │           │       │ ├─ remarks*      │                           │
│           │           │       │ ├─ debit_amount* │                           │
│           │           │       │ ├─ credit_amount*│                           │
│           │           │       │ ├─ opening_bal*  │                           │
│           │           │       │ └─ closing_bal*  │                           │
│           │           │       │                  │                           │
│           │           │       │ BENEFICIARY:     │                           │
│           │           │       │ ├─ benef_name    │                           │
│           │           │       │ ├─ benef_account │                           │
│           │           │       │ ├─ benef_ifsc    │                           │
│           │           │       │ └─ benef_bank    │                           │
│           │           │       │                  │                           │
│           │           │       │ AUDIT FIELDS:    │                           │
│           │           │       │ ├─ ip_address    │                           │
│           │           │       │ ├─ device_info   │                           │
│           │           │       │ └─ location      │                           │
│           │           │       └──────────────────┘                           │
│           │           │                                                      │
│           │           └──────────────────┐                                   │
│           │                              ▼                                   │
│           │              ┌─────────────────────────┐                         │
│           │              │    SELF REFERENCE       │                         │
│           │              │  (Distributor-Retailer) │                         │
│           │              │   Multi-level Hierarchy │                         │
│           │              └─────────────────────────┘                         │
│           │                                                                  │
│           ▼                                                                  │
│  ┌─────────────────┐                ┌─────────────────┐                     │
│  │    PAYMENTS     │                │   COMMISSIONS   │                     │
│  │                 │                │                 │                     │
│  │ PK: id          │                │ PK: id          │                     │
│  │ UK: transId     │                │ FK: userId      │                     │
│  │ FK: userId      │                │ FK: transactionId│                    │
│  │ amount          │                │ commissionRate  │                     │
│  │ status          │                │ commissionAmount│                     │
│  │ paymentMethod   │                │ level (1,2,3)   │                     │
│  │ gatewayResponse │                │ parentUserId    │                     │
│  │ refundAmount    │                │ calculatedAt    │                     │
│  │ phonepe_ref     │                └─────────────────┘                     │
│  │ callback_data   │                                                        │
│  └─────────────────┘                                                        │
│                                                                             │
│  * Enhanced fields added in September 2025 migration                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 🔗 **ENHANCED RELATIONSHIP DETAILS**

### **1. USERS ↔ TRANSACTIONS (One-to-Many Enhanced)**
```sql
-- Primary relationship
users.id ←→ transactions.userId (Transaction owner)
users.id ←→ transactions.recipientId (Transfer recipient)

-- Enhanced with user code mapping
users.user_code ←→ transactions.user_code (Ledger identification)
```

### **2. USERS ↔ PAYMENTS (One-to-Many)**
```sql
users.id ←→ payments.userId (Payment initiator)
-- Enhanced with payment gateway integration
```

### **3. USERS ↔ BENEFICIARIES (One-to-Many)**
```sql
users.id ←→ beneficiaries.userId (Beneficiary owner)
-- Enhanced with verification status and account details
```

### **4. USERS ↔ USERS (Self-Reference - MLM Structure)**
```sql
users.id ←→ users.parentDistributorId (Multi-level hierarchy)
-- Supports commission calculation and referral tracking
```

### **5. TRANSACTIONS ↔ COMMISSIONS (One-to-Many)**
```sql
transactions.id ←→ commissions.transactionId (Commission source)
-- Multi-level commission calculation
```

## 📊 **ENHANCED DATABASE SCHEMA (AWS RDS MySQL)**

### **USERS Table (Enhanced)**
```sql
CREATE TABLE users (
  -- Primary identifiers
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(15) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  
  -- Basic profile
  full_name VARCHAR(255),
  wallet_balance DECIMAL(15,2) DEFAULT 0.00,
  avatar_url VARCHAR(500),
  date_of_birth DATE,
  address TEXT,
  
  -- Business logic (ENHANCED)
  role ENUM('customer', 'retailer', 'distributor', 'admin') DEFAULT 'customer',
  kyc_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
  commission_rate DECIMAL(5,4) DEFAULT 0.0000,
  parent_distributor_id INT,
  user_code VARCHAR(50) UNIQUE,                    -- NEW: Ledger identification
  daily_limit DECIMAL(15,2) DEFAULT 25000.00,     -- NEW: Daily transaction limit
  monthly_limit DECIMAL(15,2) DEFAULT 100000.00,  -- NEW: Monthly transaction limit
  
  -- Security and status
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  last_login TIMESTAMP NULL,
  
  -- Audit fields
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Performance indexes
  INDEX idx_email (email),
  INDEX idx_phone (phone),
  INDEX idx_username (username),
  INDEX idx_user_code (user_code),              -- NEW
  INDEX idx_role (role),
  INDEX idx_kyc_status (kyc_status),
  INDEX idx_parent_distributor (parent_distributor_id),
  
  FOREIGN KEY (parent_distributor_id) REFERENCES users(id) ON DELETE SET NULL
);
```

### **TRANSACTIONS Table (Significantly Enhanced)**
```sql
CREATE TABLE transactions (
  -- Primary identifiers
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  from_account_id INT,
  to_account_id INT,
  recipient_id INT,
  
  -- Core transaction data
  transaction_type ENUM('deposit', 'withdrawal', 'transfer', 'recharge', 'bill_payment', 'commission', 'refund') NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  fee_amount DECIMAL(10,2) DEFAULT 0.00,
  currency VARCHAR(3) DEFAULT 'INR',
  description TEXT,
  reference_number VARCHAR(255) UNIQUE,
  bank_reference VARCHAR(255),
  utr_number VARCHAR(255),
  payment_method ENUM('wallet', 'phonepe', 'upi', 'netbanking', 'card') DEFAULT 'wallet',
  status ENUM('pending', 'completed', 'failed', 'cancelled', 'refunded') DEFAULT 'pending',
  failure_reason TEXT,
  processed_at TIMESTAMP NULL,
  
  -- ENHANCED LEDGER SYSTEM (September 2025)
  beneficiary_name VARCHAR(255),               -- Recipient details
  beneficiary_account VARCHAR(100),
  beneficiary_ifsc VARCHAR(11),
  beneficiary_bank VARCHAR(255),
  opening_balance DECIMAL(15,2),               -- Balance before transaction
  closing_balance DECIMAL(15,2),               -- Balance after transaction
  ledger_date DATE,                            -- Transaction ledger date
  user_code VARCHAR(50),                       -- User identification code
  ledger_type ENUM('TopIn', 'Transfer', 'Recharge', 'Bill', 'Commission', 'Refund') DEFAULT 'TopIn',
  remarks TEXT,                                -- Detailed transaction remarks
  debit_amount DECIMAL(15,2) DEFAULT 0.00,     -- Debit entry for ledger
  credit_amount DECIMAL(15,2) DEFAULT 0.00,    -- Credit entry for ledger
  
  -- AUDIT AND SECURITY (Enhanced)
  ip_address VARCHAR(45),                      -- Client IP address
  device_info TEXT,                            -- Device information
  location VARCHAR(255),                       -- Transaction location
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- PERFORMANCE INDEXES (Optimized for AWS RDS)
  INDEX idx_user_date (user_id, created_at),
  INDEX idx_reference (reference_number),
  INDEX idx_status (status),
  INDEX idx_transaction_type (transaction_type),
  INDEX idx_ledger_date (ledger_date),         -- NEW: Ledger queries
  INDEX idx_user_code (user_code),             -- NEW: User code lookup
  INDEX idx_ledger_type (ledger_type),         -- NEW: Ledger type filtering
  INDEX idx_amount (amount),                   -- NEW: Amount range queries
  INDEX idx_payment_method (payment_method),   -- NEW: Payment method analytics
  
  -- FOREIGN KEY CONSTRAINTS
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (from_account_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (to_account_id) REFERENCES users(id) ON DELETE SET NULL
);
```

### **PAYMENTS Table (PhonePe Integration)**
```sql
CREATE TABLE payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  transaction_id INT,
  
  -- Payment gateway data
  phonepe_transaction_id VARCHAR(255) UNIQUE,
  phonepe_merchant_transaction_id VARCHAR(255) UNIQUE,
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  
  -- Payment status and details
  status ENUM('pending', 'success', 'failed', 'cancelled', 'expired') DEFAULT 'pending',
  payment_method ENUM('upi', 'card', 'netbanking', 'wallet') NOT NULL,
  gateway_response TEXT,
  callback_data JSON,
  
  -- URLs and references
  success_url VARCHAR(500),
  failure_url VARCHAR(500),
  callback_url VARCHAR(500),
  
  -- Refund information
  refund_amount DECIMAL(15,2) DEFAULT 0.00,
  refund_reason TEXT,
  refunded_at TIMESTAMP NULL,
  
  -- Audit fields
  initiated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  expires_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_user_payment (user_id, status),
  INDEX idx_phonepe_trans (phonepe_transaction_id),
  INDEX idx_merchant_trans (phonepe_merchant_transaction_id),
  INDEX idx_status_date (status, created_at),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL
);
```

### **BENEFICIARIES Table (Enhanced)**
```sql
CREATE TABLE beneficiaries (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  
  -- Beneficiary details
  beneficiary_name VARCHAR(255) NOT NULL,
  account_number VARCHAR(100) NOT NULL,
  ifsc_code VARCHAR(11) NOT NULL,
  bank_name VARCHAR(255) NOT NULL,
  account_type ENUM('savings', 'current', 'overdraft') DEFAULT 'savings',
  
  -- Relationship and verification
  relationship VARCHAR(100),
  nickname VARCHAR(100),
  is_verified BOOLEAN DEFAULT FALSE,
  verification_date TIMESTAMP NULL,
  
  -- Status and limits
  is_active BOOLEAN DEFAULT TRUE,
  daily_limit DECIMAL(15,2),
  monthly_limit DECIMAL(15,2),
  
  -- Audit fields
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_user_beneficiary (user_id, is_active),
  INDEX idx_account_ifsc (account_number, ifsc_code),
  INDEX idx_verification (is_verified, verification_date),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_account (user_id, account_number, ifsc_code)
);
```

## 📋 **ENHANCED DATA FLOW ARCHITECTURE**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     NEXASPAY FINTECH SYSTEM ARCHITECTURE                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐   │
│  │   FRONTEND  │────│   API GW    │────│ SERVERLESS  │────│   AWS RDS   │   │
│  │   (Vercel)  │    │ (Express)   │    │ (Vercel)    │    │   (MySQL)   │   │
│  │             │    │             │    │             │    │             │   │
│  │ - React 18  │    │ - CORS      │    │ - Node.js   │    │ - Prod DB   │   │
│  │ - Redux     │    │ - Auth      │    │ - Express   │    │ - Backups   │   │
│  │ - Tailwind  │    │ - Rate Lmt  │    │ - Sequelize │    │ - Monitoring│   │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘   │
│         │                    │                   │                  │       │
│         │                    │                   │                  │       │
│         ▼                    ▼                   ▼                  ▼       │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐   │
│  │USER ACTIONS │    │ MIDDLEWARE  │    │  BUSINESS   │    │  ENHANCED   │   │
│  │             │    │  LAYER      │    │   LOGIC     │    │   SCHEMA    │   │
│  │ - Wallet    │    │             │    │             │    │             │   │
│  │ - Payments  │    │ - JWT Auth  │    │ - Wallet    │    │ - Ledger    │   │
│  │ - Transfers │    │ - Validation│    │ - Payments  │    │ - Audit     │   │
│  │ - Bills     │    │ - Logging   │    │ - Analytics │    │ - Indexes   │   │
│  │ - Analytics │    │ - Security  │    │ - Reports   │    │ - Relations │   │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 💳 **ENHANCED PAYMENT GATEWAY FLOW (PhonePe)**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PHONEPE PAYMENT INTEGRATION FLOW                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐   │
│  │    USER     │    │  FRONTEND   │    │   BACKEND   │    │   PHONEPE   │   │
│  │             │    │ (React App) │    │ (Serverless)│    │   GATEWAY   │   │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘   │
│         │                    │                   │                  │       │
│         │ 1. Add Money       │                   │                  │       │
│         ├───────────────────►│                   │                  │       │
│         │                    │ 2. POST /payments │                  │       │
│         │                    │    /initiate      │                  │       │
│         │                    ├──────────────────►│                  │       │
│         │                    │                   │ 3. Create Payment│       │
│         │                    │                   │    Record        │       │
│         │                    │                   │                  │       │
│         │                    │                   │ 4. PhonePe API   │       │
│         │                    │                   ├─────────────────►│       │
│         │                    │                   │    /pay          │       │
│         │                    │                   │                  │       │
│         │                    │                   │ 5. Payment URL   │       │
│         │                    │ 6. Redirect URL   │◄─────────────────┤       │
│         │ 7. PhonePe Page    │◄──────────────────┤                  │       │
│         │◄───────────────────┤                   │                  │       │
│         │                    │                   │                  │       │
│         │ 8. Complete Payment│                   │                  │       │
│         ├───────────────────►│                   │                  │       │
│         │                    │                   │                  │       │
│         │                    │                   │ 9. Webhook       │       │
│         │                    │                   │◄─────────────────┤       │
│         │                    │                   │ 10. Update DB    │       │
│         │                    │                   │     - Payment    │       │
│         │                    │                   │     - Transaction│       │
│         │                    │                   │     - Wallet Bal │       │
│         │                    │                   │                  │       │
│         │                    │ 11. Success Page  │                  │       │
│         │ 12. Confirmation   │◄──────────────────┤                  │       │
│         │    + Receipt       │                   │                  │       │
│         │◄───────────────────┤                   │                  │       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 🏗️ **MICROSERVICES ARCHITECTURE (Enhanced)**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   NEXASPAY MICROSERVICES ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │  AUTH SERVICE   │  │ WALLET SERVICE  │  │ PAYMENT SERVICE │             │
│  │  (Enhanced)     │  │  (Enhanced)     │  │  (Enhanced)     │             │
│  │                 │  │                 │  │                 │             │
│  │ - Registration  │  │ - Balance Mgmt  │  │ - PhonePe Integ │             │
│  │ - JWT Tokens    │  │ - P2P Transfers │  │ - Webhook Hand  │             │
│  │ - KYC Verify    │  │ - Ledger System │  │ - Status Track  │             │
│  │ - Role Mgmt     │  │ - Transaction   │  │ - Refund Handle │             │
│  │ - 2FA Support   │  │   History       │  │ - Gateway APIs  │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│           │                     │                     │                     │
│           └─────────────────────┼─────────────────────┘                     │
│                                 │                                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │  USER SERVICE   │  │FINANCIAL SERVICE│  │ANALYTICS SERVICE│             │
│  │  (Enhanced)     │  │  (Enhanced)     │  │     (NEW)       │             │
│  │                 │  │                 │  │                 │             │
│  │ - Profile Mgmt  │  │ - Recharge APIs │  │ - Dashboard     │             │
│  │ - KYC Documents │  │ - Bill Payments │  │ - Reports       │             │
│  │ - Beneficiaries │  │ - BBPS Integr   │  │ - Trends        │             │
│  │ - Limits Mgmt   │  │ - Commission    │  │ - Insights      │             │
│  │ - MLM Hierarchy │  │ - Ledger Export │  │ - Performance   │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 🔐 **ENHANCED SECURITY LAYERS**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     COMPREHENSIVE SECURITY ARCHITECTURE                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    APPLICATION SECURITY LAYER                      │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │   │
│  │  │INPUT VALID  │  │RATE LIMITING│  │ENCRYPTION   │  │AUDIT LOGS   │ │   │
│  │  │- Joi Schema │  │- IP Based   │  │- AES-256    │  │- All Actions│ │   │
│  │  │- Sanitize   │  │- User Based │  │- bcrypt     │  │- Error Track│ │   │
│  │  │- SQL Inject │  │- API Limits │  │- JWT Secure │  │- Performance│ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                     │                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                   AUTHENTICATION & AUTHORIZATION                   │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │   │
│  │  │JWT STRATEGY │  │ROLE-BASED   │  │REFRESH TOK  │  │SESSION MGMT │ │   │
│  │  │- Access Tok │  │- Permissions│  │- Auto Renew │  │- Device Track│ │   │
│  │  │- Expire Mgmt│  │- Multi-level│  │- Secure Stor│  │- Location   │ │   │
│  │  │- Signature  │  │- ACL Rules  │  │- Revocation │  │- IP Monitor │ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                     │                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    DATABASE SECURITY LAYER                         │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │   │
│  │  │AWS RDS SEC  │  │QUERY SECURE │  │TRANSACTION  │  │BACKUP & REC │ │   │
│  │  │- SSL/TLS    │  │- Parameteriz│  │- ACID Props │  │- Auto Backup│ │   │
│  │  │- Encryption │  │- ORM Safety │  │- Rollback   │  │- Point-in-T │ │   │
│  │  │- Access Ctrl│  │- Prepared   │  │- Isolation  │  │- Encryption │ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 📊 **PERFORMANCE OPTIMIZATION (AWS RDS)**

### **Strategic Database Indexes (Deployed)**
```sql
-- User performance indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_user_code ON users(user_code);
CREATE INDEX idx_users_role_kyc ON users(role, kyc_status);

-- Enhanced transaction indexes (NEW - September 2025)
CREATE INDEX idx_transactions_user_date ON transactions(user_id, created_at);
CREATE INDEX idx_transactions_ledger_date ON transactions(ledger_date);
CREATE INDEX idx_transactions_user_code ON transactions(user_code);
CREATE INDEX idx_transactions_ledger_type ON transactions(ledger_type);
CREATE INDEX idx_transactions_status_type ON transactions(status, transaction_type);
CREATE INDEX idx_transactions_amount_range ON transactions(amount, created_at);

-- Payment gateway indexes
CREATE INDEX idx_payments_phonepe_ref ON payments(phonepe_transaction_id);
CREATE INDEX idx_payments_status_date ON payments(status, created_at);
CREATE INDEX idx_payments_user_status ON payments(user_id, status);

-- Beneficiary indexes
CREATE INDEX idx_beneficiaries_user_active ON beneficiaries(user_id, is_active);
CREATE INDEX idx_beneficiaries_account_ifsc ON beneficiaries(account_number, ifsc_code);
```

### **Query Optimization Strategies**
- **Pagination**: Efficient LIMIT/OFFSET with cursor-based pagination
- **Eager Loading**: Optimized JOIN queries for related data
- **Connection Pooling**: AWS RDS optimized pool settings
- **Caching Layer**: Redis-compatible caching for frequently accessed data
- **Query Analysis**: Regular EXPLAIN analysis for optimization

### **Performance Targets (Production)**
- **Wallet Balance**: < 50ms response time
- **Transaction History**: < 200ms with pagination
- **Payment Initiation**: < 500ms end-to-end
- **Database Queries**: < 100ms average
- **API Throughput**: 1000+ requests/minute

## 🚀 **AWS RDS DEPLOYMENT ARCHITECTURE**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AWS RDS PRODUCTION DEPLOYMENT                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │   FRONTEND      │    │    BACKEND      │    │   AWS RDS       │         │
│  │   (Vercel)      │    │   (Vercel)      │    │   (MySQL)       │         │
│  │                 │    │                 │    │                 │         │
│  │ - React SPA     │    │ - Serverless    │    │ - Production DB │         │
│  │ - Static Deploy │    │ - Node.js API   │    │ - Multi-AZ      │         │
│  │ - CDN Global    │    │ - Auto Scale    │    │ - Auto Backup   │         │
│  │ - SSL/HTTPS     │    │ - Connection    │    │ - Monitoring    │         │
│  │                 │    │   Pooling       │    │ - SSL/TLS       │         │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘         │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    MONITORING & OBSERVABILITY                      │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │   │
│  │  │VERCEL LOGS  │  │AWS CLOUDWTCH│  │ERROR TRACK  │  │PERF MONITOR │ │   │
│  │  │- API Logs   │  │- DB Metrics │  │- Exception  │  │- Response T │ │   │
│  │  │- Deploy Log │  │- Connections│  │- Stack Trace│  │- Throughput │ │   │
│  │  │- Error Log  │  │- Query Time │  │- Alert Sys  │  │- Uptime     │ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 📈 **MIGRATION STATUS (Latest Update)**

### **September 18, 2025 Migration Results**
```bash
✅ ENHANCED TRANSACTION SCHEMA DEPLOYED
   ├─ Added ledger_date (DATE) - Transaction ledger date
   ├─ Added user_code (VARCHAR) - User identification code  
   ├─ Added ledger_type (ENUM) - Transaction categorization
   ├─ Added remarks (TEXT) - Detailed transaction notes
   ├─ Added debit_amount (DECIMAL) - Debit entry for ledger
   ├─ Added credit_amount (DECIMAL) - Credit entry for ledger
   ├─ Added opening_balance (DECIMAL) - Pre-transaction balance
   └─ Added closing_balance (DECIMAL) - Post-transaction balance

✅ PERFORMANCE INDEXES CREATED
   ├─ idx_transactions_ledger_date - Ledger date queries
   ├─ idx_transactions_user_code - User code lookups
   ├─ idx_transactions_ledger_type - Ledger type filtering
   └─ Additional composite indexes for complex queries

✅ DATA MIGRATION COMPLETED
   ├─ Migrated 3 existing transactions successfully
   ├─ Populated new fields with appropriate data
   ├─ Verified data integrity and consistency
   └─ All API endpoints updated for new schema

✅ PRODUCTION DEPLOYMENT VERIFIED
   ├─ AWS RDS connection stable
   ├─ Serverless functions optimized
   ├─ API response times < 200ms
   └─ Error handling comprehensive
```

---

**🔗 Production Database**: AWS RDS MySQL (database-1.csv82cm2o697.us-east-1.rds.amazonaws.com)

**📊 Schema Version**: 2.0.0 (Enhanced Ledger System)

**📅 Last Migration**: September 18, 2025  
**🚀 Status**: Production Active  
**👨‍💻 Database Admin**: Adarsh Ramgirwar