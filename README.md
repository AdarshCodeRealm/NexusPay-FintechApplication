# NEXASPAY - Digital Fintech Application

A modern, full-stack fintech application built with React, Node.js, and MySQL, designed for seamless digital wallet management and payment processing.

## 🌐 Live Application

- **Frontend (Client)**: [https://nexus-pay-fintech-application-8gni.vercel.app/dashboard](https://nexus-pay-fintech-application-8gni.vercel.app/dashboard)
- **Backend (Server)**: [https://nexus-pay-fintech-application.vercel.app/](https://nexus-pay-fintech-application.vercel.app/)

## 🚀 Features

### Frontend Features
- **Modern UI/UX**: Built with React and Tailwind CSS
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Digital Wallet**: Interactive wallet management with real-time balance updates
- **Payment Integration**: PhonePe payment gateway integration
- **Transaction History**: Comprehensive transaction tracking and receipt generation
- **User Authentication**: Secure login/logout with JWT tokens
- **Profile Management**: User profile and KYC functionality
- **Dashboard**: Intuitive dashboard with financial insights

### Backend Features
- **RESTful API**: Express.js based API with proper routing
- **Database Management**: MySQL with Sequelize ORM
- **Authentication**: JWT-based authentication with refresh tokens
- **Payment Processing**: PhonePe payment gateway integration
- **File Uploads**: Cloudinary integration for documents and avatars
- **Serverless Deployment**: Optimized for Vercel serverless functions
- **Security**: CORS, input validation, and secure password hashing

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **UI Components**: Custom UI components with shadcn/ui
- **Routing**: React Router
- **HTTP Client**: Axios
- **Build Tool**: Vite

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL (Amazon RDS)
- **ORM**: Sequelize
- **Authentication**: JWT (JSON Web Tokens)
- **Payment Gateway**: PhonePe
- **File Storage**: Cloudinary
- **Deployment**: Vercel Serverless Functions

## 📁 Project Structure

```
NEXASPAY - FINTECH/
├── Client/                   # React frontend application
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── store/           # Redux store and slices
│   │   ├── lib/             # Utility functions
│   │   └── ...
│   ├── public/              # Static assets
│   └── package.json
├── Server/                  # Node.js backend application
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── middlewares/     # Custom middlewares
│   │   └── ...
│   └── package.json
└── README.md               # This file
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MySQL database
- Git

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
   - Copy `.env.example` to `.env` in both Client and Server directories
   - Update environment variables with your configurations

5. **Database Setup**
```bash
# In Server directory
npm run migrate
npm run seed
```

6. **Start Development Servers**
```bash
# Backend (Port 8000)
cd Server
npm run dev

# Frontend (Port 5173)
cd Client
npm run dev
```

## 🌐 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/refresh-token` - Refresh access token

### Wallet Management
- `GET /api/v1/wallet/balance` - Get wallet balance
- `POST /api/v1/wallet/add-money` - Add money to wallet
- `POST /api/v1/wallet/withdraw` - Withdraw money
- `GET /api/v1/wallet/transactions` - Get transaction history

### Payments
- `POST /api/v1/payments/initiate` - Initiate PhonePe payment
- `POST /api/v1/payments/verify` - Verify payment status
- `POST /api/v1/payments/callback` - Payment callback handler

### User Management
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile
- `POST /api/v1/users/upload-avatar` - Upload profile picture

## 📱 Key Features

### Digital Wallet
- Real-time balance updates
- Multiple payment methods (PhonePe, UPI, Net Banking, Cards)
- Transaction history with filtering and pagination
- Receipt generation and download

### Payment Integration
- PhonePe payment gateway
- Secure payment processing
- Real-time payment status updates
- Payment verification and callbacks

### User Experience
- Responsive design for all devices
- Modern UI with smooth animations
- Real-time notifications and toasts
- Comprehensive error handling

## 🔐 Security Features

- JWT-based authentication
- Secure password hashing (bcrypt)
- Input validation and sanitization
- CORS configuration
- Rate limiting
- Secure payment processing

## 🚀 Deployment

Both frontend and backend are deployed on Vercel:

- **Frontend**: Deployed from the `Client` directory
- **Backend**: Deployed as serverless functions from the `Server` directory

### Environment Variables Required:
- Database credentials (MySQL)
- JWT secrets
- PhonePe merchant configuration
- Cloudinary configuration
- CORS origins

## 🧪 Testing

### Frontend Testing
```bash
cd Client
npm run test
```

### Backend Testing
```bash
cd Server
npm run test
```

### API Testing
Use the provided Postman collection or test endpoints directly:
```bash
curl https://nexus-pay-fintech-application.vercel.app/api/v1/health
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 📞 Support

For support and questions:
- Check the documentation in `/Server/README.md` for detailed backend information
- Review the troubleshooting section for common issues
- Verify environment variables and configurations

---

**Live Application**: [https://nexus-pay-fintech-application-8gni.vercel.app/dashboard](https://nexus-pay-fintech-application-8gni.vercel.app/dashboard)

**API Base URL**: [https://nexus-pay-fintech-application.vercel.app/](https://nexus-pay-fintech-application.vercel.app/)

**Last Updated**: September 9, 2025
**Version**: 1.0.0