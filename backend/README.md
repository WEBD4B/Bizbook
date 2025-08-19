# BizBook Backend API

A comprehensive financial management system backend built with Node.js, Express, and PostgreSQL.

## 🚀 Features

### Personal Finance Management
- **Credit Cards**: Track balances, limits, payments, and rewards
- **Loans**: Monitor loan balances, payments, and payoff schedules
- **Income**: Manage multiple income sources and frequencies
- **Expenses**: Categorize and track personal expenses
- **Savings Goals**: Set and monitor financial goals
- **Budgets**: Create and track budgeting categories
- **Investments**: Portfolio tracking and performance monitoring
- **Assets & Liabilities**: Comprehensive net worth calculation
- **Financial Calculations**: Payoff scenarios and projections

### Business Finance Management
- **Business Profiles**: Multi-business support
- **Business Credit Cards**: Separate business credit tracking
- **Business Loans**: Commercial loan management
- **Revenue Tracking**: Business income and sales monitoring
- **Business Expenses**: Tax-deductible expense tracking
- **Vendor Management**: Supplier and vendor database
- **Purchase Orders**: Complete PO lifecycle management
- **Tax Management**: Business tax preparation support

### API Features
- **RESTful Design**: Clean, intuitive API endpoints
- **Authentication**: JWT-based secure authentication
- **Data Validation**: Comprehensive input validation with Zod
- **Rate Limiting**: Protection against abuse
- **Error Handling**: Structured error responses
- **Security**: Helmet, CORS, and security best practices
- **Database**: PostgreSQL with Drizzle ORM
- **Session Pooling**: Optimized for Supabase session pooler

## 🛠️ Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: PostgreSQL (Supabase compatible)
- **ORM**: Drizzle ORM
- **Validation**: Zod
- **Authentication**: JWT + bcryptjs
- **Security**: Helmet, CORS, express-rate-limit
- **Utilities**: UUID, compression, morgan logging

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database (or Supabase account)
- npm or yarn package manager

## ⚡ Quick Start

### 1. Clone and Install
```bash
git clone <repository-url>
cd backend
npm install
```

### 2. Environment Configuration
Copy the example environment file and configure your settings:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Database Configuration (Supabase Session Pooler)
DATABASE_URL=postgresql://postgres.ujltxyrapywquitviwlo:[YOUR-PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres

# Replace [YOUR-PASSWORD] with your actual Supabase password
DB_HOST=aws-1-ap-southeast-1.pooler.supabase.com
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres.ujltxyrapywquitviwlo
DB_PASSWORD=[YOUR-PASSWORD]

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
BCRYPT_ROUNDS=12

# Server Configuration
NODE_ENV=development
PORT=5000

# CORS Origins (comma-separated)
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

### 3. Database Setup
Run the database migrations:
```bash
# Generate migration files
npm run generate

# Apply migrations
npm run migrate

# Or manually run the SQL migration
psql -d "your_database_url" -f migrations/001_initial_schema.sql
```

### 4. Start the Server
```bash
# Development mode with hot reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
All protected endpoints require a Bearer token in the Authorization header:
```bash
Authorization: Bearer <your-jwt-token>
```

### Core Endpoints

#### Authentication
```
POST /api/auth/register    # User registration
POST /api/auth/login       # User login
POST /api/auth/verify      # Token verification
POST /api/auth/refresh     # Token refresh
```

#### Personal Finance
```
GET|POST|PATCH|DELETE /api/credit-cards
GET|POST|PATCH|DELETE /api/loans
GET|POST|PATCH|DELETE /api/monthly-payments
GET|POST|PATCH|DELETE /api/income
GET|POST|PATCH|DELETE /api/expenses
GET|POST|PATCH|DELETE /api/savings-goals
GET|POST|PATCH|DELETE /api/budgets
GET|POST|PATCH|DELETE /api/investments
GET|POST|PATCH|DELETE /api/assets
GET|POST|PATCH|DELETE /api/liabilities
```

#### Net Worth & Calculations
```
GET|POST /api/net-worth-snapshots
GET /api/net-worth-snapshots/latest
POST /api/calculate-net-worth
POST /api/calculate-payoff
```

#### Business Management
```
GET|POST|PUT|DELETE /api/business-profiles
GET|POST|PUT|DELETE /api/business-credit-cards
GET|POST|PUT|DELETE /api/business-loans
GET|POST /api/business-revenue
GET|POST /api/business-expenses
GET|POST|PUT|DELETE /api/vendors
GET|POST|PUT|DELETE /api/purchase-orders
GET|POST|PUT|DELETE /api/purchase-order-items
```

### Request/Response Format

#### Successful Response
```json
{
  "success": true,
  "data": {...},
  "total": 10  // For list endpoints
}
```

#### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": [...] // Validation errors if applicable
}
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs with configurable rounds
- **Rate Limiting**: Configurable request limits per IP
- **Input Validation**: Comprehensive validation with Zod schemas
- **SQL Injection Protection**: Parameterized queries via Drizzle ORM
- **CORS Protection**: Configurable cross-origin resource sharing
- **Security Headers**: Helmet.js for security headers
- **Environment Variables**: Sensitive data in environment configuration

## 🗄️ Database Schema

The database includes the following main entities:

- **users**: User account management
- **credit_cards**: Personal credit card tracking
- **loans**: Personal loan management
- **income**: Income source tracking
- **expenses**: Personal expense categorization
- **assets/liabilities**: Net worth calculation components
- **business_profiles**: Multi-business support
- **vendors**: Supplier management
- **purchase_orders**: Complete PO workflow
- **business_credit_cards/business_loans**: Business financial instruments

All tables include:
- UUID primary keys
- User-based data isolation
- Created/updated timestamps
- Proper foreign key relationships
- Performance indexes

## 📊 Performance Optimizations

- **Connection Pooling**: Optimized PostgreSQL connection management
- **Session Pooler**: Compatible with Supabase session pooling
- **Database Indexes**: Strategic indexing for query performance
- **Compression**: Response compression middleware
- **Error Handling**: Async error wrapper for clean error management
- **Input Validation**: Early validation to prevent unnecessary processing

## 🔧 Development Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run generate   # Generate Drizzle migration files
npm run migrate    # Apply database migrations
npm test           # Run test suite
```

## 🌍 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `BCRYPT_ROUNDS` | Password hashing rounds | `12` |
| `CORS_ORIGIN` | Allowed CORS origins | `http://localhost:3000,http://localhost:5173` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |

## 🚀 Deployment

### Supabase Deployment
1. Create a new Supabase project
2. Get your session pooler connection string
3. Run the migration SQL in the Supabase SQL editor
4. Deploy your backend to your preferred hosting service
5. Configure environment variables

### Docker Deployment
```bash
# Build Docker image
docker build -t bizbook-api .

# Run container
docker run -p 5000:5000 --env-file .env bizbook-api
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Email: support@bizbook.com
- Documentation: https://docs.bizbook.com

## 🔄 Version History

- **v1.0.0**: Initial release with core financial management features
  - Personal finance tracking
  - Business management tools
  - Authentication and security
  - PostgreSQL database integration
  - RESTful API design

---

Built with ❤️ for comprehensive financial management
