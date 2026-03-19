# PromoVault — Coupon & Discount Management System

A full-stack MERN application for managing promotional offers, coupon generation, and discount validation.

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, React Router v6, Recharts |
| Backend   | Node.js, Express.js                 |
| Database  | MongoDB + Mongoose                  |
| Auth      | JWT (jsonwebtoken) + bcryptjs        |
| Styling   | Custom CSS (no framework)           |

---

## Project Structure

```
promovault/
├── backend/
│   ├── controllers/        # Business logic
│   ├── middleware/         # JWT auth middleware
│   ├── models/             # Mongoose schemas
│   ├── routes/             # Express routes
│   ├── server.js           # Entry point
│   ├── seed.js             # Demo data seeder
│   └── .env.example
└── frontend/
    ├── public/
    └── src/
        ├── components/     # Layout, Topbar, Badges
        ├── context/        # AuthContext (JWT state)
        ├── pages/
        │   ├── customer/   # Dashboard, BrowseOffers, Checkout, MyCoupons
        │   ├── manager/    # Dashboard, ManageCoupons, Reports
        │   └── admin/      # Dashboard, UserManagement, CouponMonitor, AdminReports, SystemRecords
        ├── utils/          # Axios API service
        └── App.js          # Routes + role-protected wrappers
```

---

## Setup Instructions

### 1. Prerequisites
- Node.js v18+
- MongoDB running locally (or MongoDB Atlas URI)

---

### 2. Backend Setup

```bash
cd backend
npm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env — set MONGO_URI and JWT_SECRET

# Start the server
npm run dev
```

The backend runs on **http://localhost:5000**

#### Seed demo data
```bash
npm run seed
```

This creates 3 demo users and 4 sample coupons.

**Demo credentials:**
| Role     | Email                  | Password |
|----------|------------------------|----------|
| Customer | customer@demo.com      | pass123  |
| Manager  | manager@demo.com       | pass123  |
| Admin    | admin@demo.com         | pass123  |

---

### 3. Frontend Setup

```bash
cd frontend
npm install

# Copy env file
cp .env.example .env
# REACT_APP_API_URL=http://localhost:5000/api

npm start
```

The frontend runs on **http://localhost:3000**

---

## API Endpoints

### Auth
| Method | Endpoint             | Access  |
|--------|----------------------|---------|
| POST   | /api/auth/register   | Public  |
| POST   | /api/auth/login      | Public  |
| GET    | /api/auth/me         | Any     |

### Coupons
| Method | Endpoint                    | Access           |
|--------|-----------------------------|------------------|
| GET    | /api/coupons                | Any (auth)       |
| POST   | /api/coupons                | Manager, Admin   |
| PUT    | /api/coupons/:id            | Manager, Admin   |
| DELETE | /api/coupons/:id            | Admin only       |
| PATCH  | /api/coupons/:id/toggle     | Manager, Admin   |
| POST   | /api/coupons/validate       | Customer         |

### Orders
| Method | Endpoint        | Access           |
|--------|-----------------|------------------|
| POST   | /api/orders     | Customer         |
| GET    | /api/orders/my  | Customer         |
| GET    | /api/orders     | Admin, Manager   |

### Users
| Method | Endpoint        | Access  |
|--------|-----------------|---------|
| GET    | /api/users      | Admin   |
| POST   | /api/users      | Admin   |
| PUT    | /api/users/:id  | Admin   |
| DELETE | /api/users/:id  | Admin   |

### Reports
| Method | Endpoint                       | Access           |
|--------|--------------------------------|------------------|
| GET    | /api/reports/summary           | Admin, Manager   |
| GET    | /api/reports/coupon-performance| Admin, Manager   |
| GET    | /api/reports/monthly           | Admin, Manager   |

---

## Roles & Permissions

| Feature                    | Customer | Manager | Admin |
|----------------------------|----------|---------|-------|
| Browse active coupons       | ✅       | ✅      | ✅    |
| Apply coupon at checkout    | ✅       | —       | —     |
| View own order history      | ✅       | —       | —     |
| Create / edit coupons       | —        | ✅      | ✅    |
| Toggle coupon active state  | —        | ✅      | ✅    |
| Delete coupons              | —        | —       | ✅    |
| View performance reports    | —        | ✅      | ✅    |
| Manage users                | —        | —       | ✅    |
| View all orders             | —        | ✅      | ✅    |
| System records / audit log  | —        | —       | ✅    |
