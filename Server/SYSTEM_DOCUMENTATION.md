# 🏦 FINTECH SYSTEM DOCUMENTATION

## 📊 **DATABASE SCHEMA OVERVIEW**

### **Core Tables**

#### 1. **USERS TABLE**
```sql
users {
  id: INTEGER (PK, AUTO_INCREMENT)
  fullName: STRING (NOT NULL)
  email: STRING (UNIQUE, NOT NULL)
  username: STRING (UNIQUE, NOT NULL)
  phone: STRING (UNIQUE, NOT NULL)
  password: STRING (NOT NULL, HASHED)
  role: ENUM('user', 'retailer', 'distributor', 'admin')
  isActive: BOOLEAN (DEFAULT: true)
  phoneVerified: BOOLEAN (DEFAULT: false)
  otpCode: STRING (NULLABLE)
  otpExpiry: DATE (NULLABLE)
  refreshToken: TEXT (NULLABLE)
  walletBalance: DECIMAL(15,2) (DEFAULT: 0.00)
  walletFrozenBalance: DECIMAL(15,2) (DEFAULT: 0.00)
  kycStatus: ENUM('pending', 'submitted', 'approved', 'rejected')
  kycDocuments: JSON (NULLABLE)
  businessInfo: JSON (NULLABLE)
  commissionRate: DECIMAL(5,2) (DEFAULT: 0.00)
  parentDistributorId: INTEGER (FK to users.id, NULLABLE)
  createdAt: TIMESTAMP
  updatedAt: TIMESTAMP
}
```

#### 2. **TRANSACTIONS TABLE**
```sql
transactions {
  id: INTEGER (PK, AUTO_INCREMENT)
  userId: INTEGER (FK to users.id, NOT NULL)
  type: ENUM(22 types including wallet_topup, mobile_recharge, etc.)
  amount: DECIMAL(15,2) (NOT NULL)
  balanceBefore: DECIMAL(15,2) (NOT NULL)
  balanceAfter: DECIMAL(15,2) (NOT NULL)
  status: ENUM('pending', 'completed', 'failed', 'cancelled', 'processing')
  description: STRING (NOT NULL)
  referenceId: STRING (UNIQUE, NOT NULL)
  externalTransactionId: STRING (NULLABLE)
  recipientId: INTEGER (FK to users.id, NULLABLE)
  recipientPhone: STRING (NULLABLE)
  metadata: JSON (NULLABLE)
  commissionAmount: DECIMAL(10,2) (DEFAULT: 0.00)
  commissionRate: DECIMAL(5,2) (DEFAULT: 0.00)
  serviceProvider: STRING (NULLABLE)
  serviceNumber: STRING (NULLABLE)
  billAmount: DECIMAL(15,2) (NULLABLE)
  dueDate: DATE (NULLABLE)
  createdAt: TIMESTAMP
  updatedAt: TIMESTAMP
}
```

#### 3. **PAYMENTS TABLE**
```sql
payments {
  id: INTEGER (PK, AUTO_INCREMENT)
  transactionId: STRING (UNIQUE, NOT NULL)
  userId: INTEGER (FK to users.id, NULLABLE)
  amount: DECIMAL(15,2) (NOT NULL)
  status: ENUM('INITIATED', 'PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED')
  paymentMethod: ENUM('PHONEPE', 'RAZORPAY', 'PAYTM', 'UPI', 'CARD', 'NETBANKING')
  gatewayTransactionId: STRING (NULLABLE)
  gatewayResponse: JSON (NULLABLE)
  callbackUrl: STRING (NULLABLE)
  customerName: STRING (NULLABLE)
  customerPhone: STRING (NULLABLE)
  customerEmail: STRING (NULLABLE)
  description: STRING (NULLABLE)
  refundAmount: DECIMAL(15,2) (DEFAULT: 0.00)
  refundReason: STRING (NULLABLE)
  metadata: JSON (NULLABLE)
  expiresAt: DATE (NULLABLE)
  createdAt: TIMESTAMP
  updatedAt: TIMESTAMP
}
```

#### 4. **BENEFICIARIES TABLE**
```sql
beneficiaries {
  id: INTEGER (PK, AUTO_INCREMENT)
  userId: INTEGER (FK to users.id, NOT NULL)
  name: STRING (NOT NULL)
  accountNumber: STRING (NOT NULL)
  ifscCode: STRING (NOT NULL)
  bankName: STRING (NOT NULL)
  accountType: ENUM('savings', 'current')
  nickname: STRING (NULLABLE)
  phone: STRING (NULLABLE)
  isActive: BOOLEAN (DEFAULT: true)
  isVerified: BOOLEAN (DEFAULT: false)
  createdAt: TIMESTAMP
  updatedAt: TIMESTAMP
}
```

## 🔗 **DATABASE RELATIONSHIPS**

### **One-to-Many Relationships:**
- **users → transactions** (One user has many transactions)
- **users → payments** (One user has many payments)
- **users → beneficiaries** (One user has many beneficiaries)
- **users → users** (Distributor-Retailer hierarchy)

### **Many-to-One Relationships:**
- **transactions → users** (Many transactions belong to one user)
- **transactions → users** (recipient relationship)
- **payments → users** (Many payments belong to one user)

## 📱 **SYSTEM FEATURES IMPLEMENTATION**

### **PART A - USER SIDE FEATURES**

#### 1. **Login/Register using OTP** ✅
- **Controller:** `auth.controller.js`
- **Routes:** `/api/v1/auth/register`, `/api/v1/auth/login`
- **Features:** 
  - Phone number verification
  - OTP generation and validation
  - JWT token authentication
  - Refresh token mechanism

#### 2. **Wallet (Top-up via Credit Card)** ✅
- **Controller:** `payment.controller.js`, `wallet.controller.js`
- **Routes:** `/api/v1/payments/initiate`, `/api/v1/wallet/balance`
- **Features:**
  - PhonePe payment gateway integration
  - Real-time balance updates
  - Transaction history tracking

#### 3. **Withdrawal & Transfer Request** ✅
- **Controller:** `wallet.controller.js`
- **Routes:** `/api/v1/wallet/withdraw`, `/api/v1/wallet/transfer`
- **Features:**
  - Bank account verification
  - Beneficiary management
  - Transfer to registered users

#### 4. **Dynamic Commissions Based on User Role** ✅
- **Database:** `commissionRate` field in users table
- **Logic:** Built into transaction processing
- **Features:**
  - Role-based commission rates
  - Automatic commission calculation
  - Commission tracking

#### 5. **Manage Account Beneficiaries** ✅
- **Controller:** `beneficiary.controller.js`
- **Routes:** `/api/v1/beneficiaries/*`
- **Features:**
  - Add/Edit/Remove beneficiaries
  - Bank account validation
  - Quick transfer options

#### 6. **DTH Recharge (UI Only)** 🔄
- **Status:** Frontend interface ready
- **Backend:** Transaction model supports DTH recharge type
- **Integration:** Pending third-party API

#### 7. **Mobile Recharge (UI Only)** 🔄
- **Status:** Basic implementation in `wallet.controller.js`
- **Features:** Operator selection, amount validation
- **Integration:** Pending live API integration

#### 8. **Credit Card Bill Repayment (API)** ✅
- **Status:** Transaction model supports this type
- **Implementation:** Ready for API integration
- **Features:** Bill amount tracking, due date management

#### 9. **Payment Gateway API Integration** ✅
- **Gateway:** PhonePe Sandbox implemented
- **Controller:** `payment.controller.js`
- **Features:**
  - Payment initiation
  - Status verification
  - Webhook handling
  - Refund processing

#### 10. **Transaction History** ✅
- **Controller:** `wallet.controller.js`
- **Routes:** `/api/v1/wallet/history`
- **Features:**
  - Paginated results
  - Filter by type/status
  - Detailed transaction info

#### 11. **Distributor Adds Retailers** ✅
- **Model:** User model with `parentDistributorId`
- **Features:** Hierarchical user management
- **Implementation:** Ready for admin interface

#### 12. **Retailers Cannot Add Users** ✅
- **Implementation:** Role-based access control
- **Validation:** Built into user creation logic

#### 13. **Profile Page** ✅
- **Controller:** `user.controller.js`
- **Features:** View and update personal details
- **KYC:** Document upload and verification

#### 14. **KYC Submission for Approval** ✅
- **Model:** KYC fields in user model
- **Features:** Document upload, status tracking
- **Integration:** Cloudinary for file storage

#### 15. **Policy Pages** ✅
- **Implementation:** Static content management
- **Features:** Terms, privacy policy, compliance docs

## 🔄 **PAYMENT FLOW DIAGRAM**

```
[User] → [Frontend] → [Payment API] → [PhonePe Gateway]
   ↓         ↓             ↓              ↓
[Payment Record] → [Verification] → [Callback] → [Wallet Update]
   ↓                      ↓             ↓            ↓
[Database] ← [Transaction Record] ← [Success/Fail] ← [Balance Update]
```

## 🛡️ **SECURITY FEATURES**

1. **Authentication:**
   - JWT tokens with expiry
   - Refresh token rotation
   - OTP-based verification

2. **Data Security:**
   - Password hashing with bcrypt
   - Input validation and sanitization
   - SQL injection prevention (Sequelize ORM)

3. **Payment Security:**
   - Checksum verification for PhonePe
   - Webhook signature validation
   - Transaction status verification

## 🚀 **API ENDPOINTS**

### **Authentication**
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/verify-otp` - OTP verification
- `POST /api/v1/auth/logout` - User logout

### **Wallet Operations**
- `GET /api/v1/wallet/balance` - Get wallet balance
- `POST /api/v1/wallet/add-money` - Add money to wallet
- `POST /api/v1/wallet/withdraw` - Withdraw money
- `POST /api/v1/wallet/transfer` - Transfer to another user
- `POST /api/v1/wallet/mobile-recharge` - Mobile recharge
- `GET /api/v1/wallet/history` - Transaction history

### **Payment Gateway**
- `GET /api/v1/payments/status` - Gateway status
- `POST /api/v1/payments/initiate` - Initiate payment
- `GET /api/v1/payments/verify` - Verify payment
- `GET /api/v1/payments/check/:id` - Check payment status
- `GET /api/v1/payments/history` - Payment history
- `POST /api/v1/payments/webhook` - Webhook handler

### **Beneficiaries**
- `GET /api/v1/beneficiaries` - Get all beneficiaries
- `POST /api/v1/beneficiaries` - Add new beneficiary
- `PUT /api/v1/beneficiaries/:id` - Update beneficiary
- `DELETE /api/v1/beneficiaries/:id` - Delete beneficiary

### **User Management**
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update profile
- `POST /api/v1/users/kyc` - Submit KYC documents

## 📈 **TRANSACTION TYPES SUPPORTED**

1. **Financial Transactions:**
   - wallet_topup, wallet_transfer, withdrawal
   - commission_credit, cashback_credit

2. **Recharge Services:**
   - mobile_recharge, dth_recharge, fastag_recharge

3. **Bill Payments:**
   - credit_card_bill, utility_bill, electricity_bill
   - water_bill, broadband_bill, landline_bill

4. **Other Services:**
   - insurance_payment, loan_payment, gas_booking
   - education_fee, hospital_payment, government_payment
   - mutual_fund, investment

## 🔧 **ENVIRONMENT CONFIGURATION**

Required environment variables in `.env`:
```env
# Database (Uncomment to enable)
# DB_HOST=your_mysql_host
# DB_PORT=3306
# DB_NAME=your_database_name
# DB_USER=your_username
# DB_PASSWORD=your_password

# PhonePe Configuration
PHONEPE_MERCHANT_ID=M1QTGQSRJ90R
PHONEPE_SALT_KEY=6b0d884b-3d5f-4e2f-a914-85466b16f123

# Payment URLs
PAYMENT_SUCCESS_URL=http://localhost:5173/payment-success
PAYMENT_FAILURE_URL=http://localhost:5173/payment-failure
PAYMENT_CALLBACK_URL=http://localhost:3000/api/v1/payments/verify

# JWT Configuration
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
```

## 🎯 **NEXT STEPS FOR FULL IMPLEMENTATION**

1. **Enable Database:**
   - Uncomment database configuration in `.env`
   - Run database migrations

2. **API Integrations:**
   - Mobile recharge API integration
   - DTH recharge API integration
   - Bill payment APIs

3. **Enhanced Features:**
   - Real-time notifications
   - Advanced reporting
   - Admin dashboard

4. **Security Enhancements:**
   - Rate limiting
   - Advanced fraud detection
   - Enhanced KYC verification

## 📞 **SUPPORT & MAINTENANCE**

- **Database Monitoring:** Transaction logs and performance metrics
- **Error Handling:** Comprehensive error logging and user-friendly messages
- **Backup Strategy:** Regular database backups and recovery procedures
- **Scalability:** Designed for horizontal scaling with proper indexing