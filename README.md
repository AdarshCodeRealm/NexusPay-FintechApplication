# NEXASPAY - Digital Fintech Application

A modern, full-stack fintech application built with React, Node.js, and MySQL (AWS RDS), designed for seamless digital wallet management and comprehensive payment processing with advanced financial services.

## 🌐 Live Application

- **Frontend (Client)**: [https://nexus-pay-fintech-application-8gni.vercel.app/dashboard](https://nexus-pay-fintech-application-8gni.vercel.app/dashboard)
- **Backend (Server)**: [https://nexus-pay-fintech-application.vercel.app/](https://nexus-pay-fintech-application.vercel.app/)

## ✨ Latest Updates (September 2025)

- ✅ **AWS RDS Integration**: Migrated to Amazon RDS MySQL for production-grade database
- ✅ **Enhanced Transaction Schema**: Added ledger system with debit/credit tracking
- ✅ **Advanced Receipt Generation**: Enhanced PDF receipts with complete transaction details
- ✅ **Performance Optimization**: Database indexing and query optimization for faster operations
- ✅ **Serverless Deployment**: Fully optimized for Vercel serverless functions
- ✅ **Complete Migration System**: Automated database migration scripts for seamless deployment

## 🚀 Features

### 💳 Digital Wallet & Payments
- **Advanced Wallet Management**: Real-time balance tracking with enhanced transaction history
- **Multiple Payment Methods**: PhonePe, UPI, Net Banking, Credit/Debit Cards
- **Instant Transfers**: P2P money transfers with beneficiary management
- **Transaction Ledger**: Complete debit/credit tracking with detailed financial records
- **Receipt Generation**: Professional PDF receipts with QR codes and transaction details

### 📱 Fintech Services
- **Mobile Recharges**: All major operators with instant processing
- **Bill Payments**: Utility bills, insurance, education fees, and more
- **DTH Recharges**: Comprehensive DTH service provider support
- **BBPS Integration**: Bharat Bill Payment System for secure bill payments
- **Gas Booking**: Cylinder booking and payment services

### 👥 User Management & Security
- **Multi-tier Authentication**: JWT-based secure authentication with refresh tokens
- **KYC Integration**: Complete KYC verification system
- **Role-based Access**: Support for distributors, retailers, and customers
- **Profile Management**: Comprehensive user profile with document uploads
- **Security Features**: Two-factor authentication, secure password policies

### 📊 Business Intelligence
- **Transaction Analytics**: Detailed transaction reporting and analytics
- **Commission Management**: Multi-level commission structure for distributors
- **Financial Dashboard**: Real-time financial insights and reporting
- **Audit Trail**: Complete transaction audit trail with ledger management

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: Redux Toolkit with Redux Persist
- **UI/UX**: Modern responsive design with animations
- **PDF Generation**: Client-side PDF generation with html2canvas
- **QR Codes**: QR code generation and scanning capabilities
- **HTTP Client**: Axios with interceptors and error handling

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js with modular architecture
- **Database**: MySQL on Amazon RDS (Production)
- **ORM**: Sequelize with advanced relations and migrations
- **Authentication**: JWT with access/refresh token strategy
- **Payment Gateway**: PhonePe with webhook integration
- **File Storage**: Cloudinary for document and image management
- **Deployment**: Vercel Serverless Functions

### Database & Infrastructure
- **Production DB**: Amazon RDS MySQL with automated backups
- **Connection Pooling**: Optimized for serverless environments
- **Migration System**: Automated database migrations with rollback support
- **Indexing**: Performance-optimized indexes for fast queries
- **Security**: SSL connections, encrypted passwords, SQL injection protection

## 📁 Enhanced Project Structure

```
NEXASPAY - FINTECH/
├── Client/                          # React frontend application
│   ├── src/
│   │   ├── components/              # React components
│   │   │   ├── AuthComponent.jsx    # Authentication flows
│   │   │   ├── Dashboard.jsx        # Main dashboard
│   │   │   ├── WalletComponent.jsx  # Wallet management
│   │   │   ├── TransferComponent.jsx # Money transfers
│   │   │   ├── RechargeComponent.jsx # Mobile recharges
│   │   │   ├── BBPSComponent.jsx    # Bill payments
│   │   │   ├── QRCodeComponent.jsx  # QR code functionality
│   │   │   └── ui/                  # UI components library
│   │   ├── store/                   # Redux store
│   │   │   ├── store.js            # Store configuration
│   │   │   └── slices/             # Redux slices
│   │   ├── lib/                     # Utility functions
│   │   │   ├── api.js              # API client
│   │   │   ├── pdfUtils.jsx        # PDF generation utilities
│   │   │   └── utils.js            # Helper functions
│   │   └── ...
│   ├── public/                      # Static assets
│   ├── vercel.json                  # Vercel configuration
│   └── package.json
├── Server/                          # Node.js backend application
│   ├── src/
│   │   ├── controllers/             # Route controllers
│   │   │   ├── auth.controller.js   # Authentication logic
│   │   │   ├── wallet.controller.js # Wallet operations
│   │   │   ├── payment.controller.js # Payment processing
│   │   │   └── ...
│   │   ├── models/                  # Sequelize models
│   │   │   ├── User.js             # User model
│   │   │   ├── Transaction.js      # Transaction model
│   │   │   ├── Payment.js          # Payment model
│   │   │   └── ...
│   │   ├── routes/                  # API routes
│   │   ├── middlewares/             # Custom middlewares
│   │   ├── db/                      # Database configuration
│   │   └── utils/                   # Utility functions
│   ├── api/                         # Vercel serverless functions
│   │   └── index.js                # Main API entry point
│   ├── migrations/                  # Database migration scripts
│   │   ├── fix_migration.js        # Enhanced schema migration
│   │   ├── verify_migration.js     # Migration verification
│   │   └── ...
│   ├── public/                      # Static files and receipts
│   ├── vercel.json                  # Vercel configuration
│   └── package.json
└── README.md                        # This file
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MySQL database (Local or AWS RDS)
- Git
- Vercel account (for deployment)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd "NEXASPAY - FINTECH"
```

2. **Setup Backend**
```bash
cd Server
npm install
```

3. **Setup Frontend**
```bash
cd ../Client
npm install
```

4. **Environment Configuration**
   Create `.env` file in Server directory:
```env
# Server Configuration
PORT=8000
CORS_ORIGIN=https://nexus-pay-fintech-application-8gni.vercel.app

# MySQL Database Configuration (Amazon RDS)
DB_HOST=database-1.csv82cm2o697.us-east-1.rds.amazonaws.com
DB_PORT=3306
DB_NAME=fintech_db
DB_USER=admin
DB_PASSWORD=Admin$123

# JWT Secrets
ACCESS_TOKEN_SECRET=your_super_secret_access_token_key_here_make_it_long_and_random_12345
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_super_secret_refresh_token_key_here_make_it_long_and_random_67890
REFRESH_TOKEN_EXPIRY=10d

# PhonePe Configuration
PHONEPE_MERCHANT_ID=PGTESTPAYUAT
PHONEPE_SALT_KEY=099eb0cd-02cf-4e2a-8aca-3e6c6aff0399
PHONEPE_SALT_INDEX=1

# Payment URLs
PAYMENT_SUCCESS_URL=https://nexus-pay-fintech-application-8gni.vercel.app/payment-success
PAYMENT_FAILURE_URL=https://nexus-pay-fintech-application-8gni.vercel.app/payment-failure
PAYMENT_CALLBACK_URL=https://nexus-pay-fintech-application.vercel.app/api/v1/payments/verify

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=drcu7tycg
CLOUDINARY_API_KEY=498132639172658
CLOUDINARY_API_SECRET=zmkv-mIKxpT210vlMA1H0XMKUyM
```

5. **Database Migration**
```bash
# In Server directory - Run migrations to set up database schema
node fix_migration.js
node verify_migration.js
```

6. **Start Development Servers**
```bash
# Backend (Port 8000)
cd Server
npm run dev

# Frontend (Port 5173) - In new terminal
cd Client
npm run dev
```

## 🌐 Enhanced API Endpoints

### Authentication & User Management
- `POST /api/v1/auth/register` - User registration with KYC initiation
- `POST /api/v1/auth/login` - User login with multi-factor authentication
- `POST /api/v1/auth/logout` - Secure logout with token invalidation
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `GET /api/v1/users/profile` - Get comprehensive user profile
- `PUT /api/v1/users/profile` - Update user profile and preferences
- `POST /api/v1/users/upload-avatar` - Upload profile picture
- `POST /api/v1/users/kyc` - KYC document submission

### Wallet & Transaction Management
- `GET /api/v1/wallet/balance` - Get real-time wallet balance
- `POST /api/v1/wallet/add-money` - Add money with multiple payment options
- `POST /api/v1/wallet/withdraw` - Withdraw money to bank account
- `GET /api/v1/wallet/transactions` - Enhanced transaction history with filters
- `GET /api/v1/wallet/transaction-history` - Paginated transaction history
- `POST /api/v1/wallet/transfer` - P2P money transfer
- `POST /api/v1/wallet/receipt/:id` - Generate transaction receipt

### Payment Processing
- `POST /api/v1/payments/initiate` - Initiate PhonePe payment
- `POST /api/v1/payments/verify` - Verify payment status with webhooks
- `POST /api/v1/payments/callback` - Payment gateway callback handler
- `GET /api/v1/payments/status/:id` - Check payment status
- `POST /api/v1/payments/refund` - Process payment refunds

### Fintech Services
- `POST /api/v1/recharge/mobile` - Mobile recharge with all operators
- `POST /api/v1/recharge/dth` - DTH recharge services
- `POST /api/v1/bbps/bill-payment` - BBPS bill payment integration
- `GET /api/v1/bbps/operators` - Get list of service operators
- `POST /api/v1/services/gas-booking` - Gas cylinder booking

### Beneficiary Management
- `GET /api/v1/beneficiaries` - Get user beneficiaries
- `POST /api/v1/beneficiaries` - Add new beneficiary
- `PUT /api/v1/beneficiaries/:id` - Update beneficiary details
- `DELETE /api/v1/beneficiaries/:id` - Remove beneficiary

### Analytics & Reporting
- `GET /api/v1/analytics/dashboard` - Dashboard analytics
- `GET /api/v1/reports/transactions` - Transaction reports
- `GET /api/v1/reports/commission` - Commission reports

## 📊 Database Schema (AWS RDS MySQL)

### Enhanced Transaction Schema
```sql
-- Enhanced transactions table with ledger functionality
CREATE TABLE transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  from_account_id INT,
  to_account_id INT,
  recipient_id INT,
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
  
  -- Enhanced ledger fields
  beneficiary_name VARCHAR(255),
  beneficiary_account VARCHAR(100),
  beneficiary_ifsc VARCHAR(11),
  beneficiary_bank VARCHAR(255),
  opening_balance DECIMAL(15,2),
  closing_balance DECIMAL(15,2),
  ledger_date DATE,
  user_code VARCHAR(50),
  ledger_type ENUM('TopIn', 'Transfer', 'Recharge', 'Bill', 'Commission', 'Refund') DEFAULT 'TopIn',
  remarks TEXT,
  debit_amount DECIMAL(15,2) DEFAULT 0.00,
  credit_amount DECIMAL(15,2) DEFAULT 0.00,
  
  -- Audit fields
  ip_address VARCHAR(45),
  device_info TEXT,
  location VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes for performance
  INDEX idx_user_date (user_id, created_at),
  INDEX idx_reference (reference_number),
  INDEX idx_status (status),
  INDEX idx_ledger_date (ledger_date),
  INDEX idx_user_code (user_code),
  INDEX idx_ledger_type (ledger_type),
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (recipient_id) REFERENCES users(id)
);
```

### Performance Optimizations
- **Database Indexing**: Strategic indexes on frequently queried fields
- **Connection Pooling**: Optimized for serverless environments
- **Query Optimization**: Efficient queries with proper joins and pagination
- **Caching Strategy**: Redis-like caching for frequently accessed data

## 🚀 Deployment Status

### Current Deployment
- **Frontend**: ✅ Deployed on Vercel - [Live App](https://nexus-pay-fintech-application-8gni.vercel.app/dashboard)
- **Backend**: ✅ Deployed on Vercel Serverless - [API Base](https://nexus-pay-fintech-application.vercel.app/)
- **Database**: ✅ AWS RDS MySQL with automated backups
- **File Storage**: ✅ Cloudinary for images and documents
- **Payment Gateway**: ✅ PhonePe integration with webhooks

### Deployment Features
- **Auto-deployment**: GitHub integration with automatic Vercel deployment
- **Environment Management**: Secure environment variable management
- **SSL/HTTPS**: Automatic SSL certificates for secure connections
- **CDN**: Global CDN for fast content delivery
- **Monitoring**: Built-in monitoring and error tracking

## 📱 Key Features Highlights

### 💳 Advanced Wallet System
- Real-time balance tracking with transaction history
- Enhanced PDF receipts with QR codes
- Multi-currency support (ready for expansion)
- Ledger system with complete audit trail

### 🔐 Enterprise Security
- JWT-based authentication with refresh tokens
- Encrypted password storage with bcrypt
- SQL injection prevention
- CORS protection and rate limiting
- Audit logging for all transactions

### 📊 Business Intelligence
- Transaction analytics and reporting
- Commission tracking for multi-level marketing
- Financial dashboard with insights
- Export capabilities for accounting

### 🚀 Performance & Scalability
- Serverless architecture for auto-scaling
- Database optimization with strategic indexing
- CDN integration for fast loading
- Mobile-first responsive design

## 🧪 Testing & Quality Assurance

### Testing Coverage
- Unit tests for critical business logic
- Integration tests for API endpoints
- End-to-end testing for user workflows
- Payment gateway testing with test environment

### Quality Metrics
- API response time < 200ms for wallet operations
- 99.9% uptime target with AWS RDS
- Security scan compliance
- Performance monitoring and alerting

## 📄 License

This project is licensed under the ISC License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support & Documentation

- **Server Documentation**: [/Server/README.md](./Server/README.md)
- **Database Schema**: [/Server/DATABASE_ER_DIAGRAM.md](./Server/DATABASE_ER_DIAGRAM.md)
- **API Documentation**: Available in server documentation
- **Migration Guide**: Available in server migration files

---

**🌟 Live Application**: [https://nexus-pay-fintech-application-8gni.vercel.app/dashboard](https://nexus-pay-fintech-application-8gni.vercel.app/dashboard)

**🔗 API Base URL**: [https://nexus-pay-fintech-application.vercel.app/](https://nexus-pay-fintech-application.vercel.app/)

**📅 Last Updated**: September 18, 2025  
**🚀 Version**: 2.0.0 (AWS RDS Production)  
**👨‍💻 Author**: Adarsh Ramgirwar