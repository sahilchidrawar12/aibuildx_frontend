# AiBuild X - Structural Engineering SaaS Platform

![AiBuild X](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Tech Stack](https://img.shields.io/badge/Stack-MERN-blue)
![License](https://img.shields.io/badge/License-Proprietary-red)

## 🏗️ Overview

**AiBuild X** is a complete, production-ready SaaS platform for structural engineering automation. Built with enterprise-grade architecture, it features role-based access control (RBAC), dynamic subscription management with Razorpay integration, project workflows, and a professional "Industrial Future" UI design.

### Key Highlights
- ✅ **4 Role-Based Dashboards** - SuperAdmin, Marketing, ClientAdmin, ClientEngineer
- ✅ **Dynamic Pricing Plans** - Real-time plan management without code changes
- ✅ **Razorpay Integration** - Secure payment processing with test mode
- ✅ **Subscription Gate** - Enforce access based on subscription status
- ✅ **File Upload System** - Support for PDF and DWG engineering drawings
- ✅ **Professional UI** - Industrial-tech aesthetic with glassmorphism effects
- ✅ **JWT Authentication** - Secure HttpOnly cookie-based sessions
- ✅ **MongoDB Database** - Scalable NoSQL architecture
- ✅ **Ready to Deploy** - Download and run anywhere

---

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 16+
- MongoDB (local or cloud)
- Yarn package manager

### Installation

1. **Run the Setup Script**
   ```bash
   bash /app/scripts/setup.sh
   ```
   This will automatically:
   - Install all backend dependencies
   - Install all frontend dependencies
   - Seed the database with test data

2. **Start the Application**

   **Terminal 1 - Backend:**
   ```bash
   cd /app/backend
   uvicorn server:app --host 0.0.0.0 --port 8001 --reload
   ```

   **Terminal 2 - Frontend:**
   ```bash
   cd /app/frontend
   yarn start
   ```

3. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8001
   - API Docs: http://localhost:8001/docs

---

## 🔐 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| **Super Admin** | admin@aibuildx.com | admin123 |
| **Marketing** | marketing@aibuildx.com | marketing123 |
| **Client Admin** | john@techstruct.com | john123 |
| **Client Engineer** | jane@techstruct.com | jane123 |

---

## 🎨 Tech Stack
