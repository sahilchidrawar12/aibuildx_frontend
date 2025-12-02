# AiBuild X - Deployment Guide

## Overview
AiBuild X is a complete SaaS platform for structural engineering automation with role-based access control, subscription management, and Razorpay payment integration.

## Tech Stack
- **Backend**: FastAPI (Python) + MongoDB
- **Frontend**: React + Tailwind CSS
- **Payments**: Razorpay
- **Auth**: JWT with HttpOnly Cookies

## Prerequisites
- Python 3.9+
- Node.js 16+
- MongoDB (local or cloud)
- Yarn package manager

## Installation Steps

### 1. Clone/Download the Application
```bash
# Extract the application to your desired location
cd /path/to/aibuild-x
```

### 2. Configure Environment Variables

**Backend** (`/app/backend/.env`):
```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="aibuild_x_db"
CORS_ORIGINS="*"
JWT_SECRET="your-secret-key-change-in-production"
RAZORPAY_KEY_ID="your_razorpay_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
UPLOAD_DIR="/app/backend/uploads"
```

**Frontend** (`/app/frontend/.env`):
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

### 3. Run Setup Script
```bash
chmod +x /app/scripts/setup.sh
bash /app/scripts/setup.sh
```

This will:
- Install backend dependencies
- Install frontend dependencies
- Seed the database with initial data

### 4. Start the Application

**Terminal 1 - Backend**:
```bash
cd /app/backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

**Terminal 2 - Frontend**:
```bash
cd /app/frontend
yarn start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8001

## Default Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@aibuildx.com | admin123 |
| Marketing | marketing@aibuildx.com | marketing123 |
| Client Admin | john@techstruct.com | john123 |
| Client Engineer | jane@techstruct.com | jane123 |

## Razorpay Test Mode

The application is configured with test Razorpay keys. Use Razorpay test cards:
- Card Number: 4111 1111 1111 1111
- CVV: Any 3 digits
- Expiry: Any future date

## Production Deployment

### 1. Update Environment Variables
- Change `JWT_SECRET` to a strong random string
- Update `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` with production keys
- Configure SMTP settings for email
- Set `CORS_ORIGINS` to your frontend domain

### 2. Database
- Use MongoDB Atlas or a hosted MongoDB instance
- Update `MONGO_URL` in `.env`

### 3. Backend Deployment
Options:
- AWS EC2 / DigitalOcean
- Heroku
- Docker container

### 4. Frontend Deployment
Options:
- Vercel
- Netlify
- AWS S3 + CloudFront

Build command:
```bash
cd /app/frontend
yarn build
```

## Features

### Super Admin
- Global dashboard with metrics
- Create/delete marketing users
- Manage pricing plans dynamically
- View all companies and transactions

### Marketing Team
- Onboard new companies
- Assign subscription plans
- View all companies and their status

### Client Admin
- Manage team members (add engineers)
- Subscribe/upgrade plans via Razorpay
- View all company projects
- Access billing history

### Client Engineer
- Create and upload projects (PDF/DWG)
- View all company projects
- Read-only subscription access

## Architecture

### Database Schema
- **users**: User accounts with roles
- **companies**: Client companies with subscription info
- **plans**: Pricing plans (dynamic)
- **projects**: Engineering projects with file uploads
- **transactions**: Payment records

### API Routes
- `/api/auth/*` - Authentication
- `/api/admin/*` - Super admin operations
- `/api/marketing/*` - Marketing operations
- `/api/companies/*` - Company management
- `/api/projects/*` - Project management
- `/api/subscriptions/*` - Razorpay payments
- `/api/plans` - Get pricing plans

## Security Features
- JWT tokens in HttpOnly cookies
- Password hashing with bcrypt
- Role-based access control
- Subscription status middleware
- Razorpay signature verification

## Support
For issues or questions, contact support@aibuildx.com

## License
Proprietary - All rights reserved
