# FeeFlow — Fee Collection & Receipt Management System

**Frontend Deployment:** Vercel  
**Backend Deployment:** Render  
**Database:** MongoDB Atlas  

---

## 📌 Executive Summary

**FeeFlow** is a full-stack MERN (MongoDB, Express, React, Node.js) web application designed for academic institutions to manage student fee structures, record payments securely across multiple payment modes, prevent overpayments, automatically generate sequential receipts, and track overdue fee defaulters in real-time.

---

## 🛠️ Technology Stack

| Layer | Technology | Key Responsibilities |
|---|---|---|
| **Frontend** | React 18 + Vite | Fast single-page application (SPA), responsive UI, glassmorphism card design |
| **Routing** | React Router DOM v6 | Role-protected client-side navigation (`/admin/*`, `/my-fees`, `/receipts/:receiptNo`) |
| **Styling** | Vanilla CSS3 | Custom design system, CSS variables, `@media print` optimized receipt layouts |
| **Backend** | Node.js + Express.js | RESTful JSON API, route controllers, error handling, CORS security |
| **Database** | MongoDB Atlas + Mongoose | Cloud NoSQL database with schema modeling, indexes, and relationship population |
| **Security** | JWT + bcryptjs | Token-based authentication, salted password hashing, role-based authorization |

---

## ✨ System Architecture & Key Features

### 1. Dual-Role Architecture
- **Student Role:**
  - View personal fee summary (Total Payable, Total Paid, Outstanding Balance).
  - Inspect individual course fee structures with itemized fee heads.
  - View full payment history with payment modes, dates, and transaction references.
  - View and print official computer-generated receipts for each payment.
- **Accountant / Admin Role:**
  - **Analytics Dashboard:** Real-time metrics for total fees collected, total pending dues, total transactions, and student count.
  - **Payment Mode Breakdown:** Visual percentage bars for UPI, Cash, Card, and Net Banking collections.
  - **Overdue Defaulters Alert List:** Real-time detection of students whose pending balance is greater than zero and past the due date.
  - **Fee Structure Management:** Add, view, edit, and delete course fee structures with custom fee heads (Tuition, Examination, Library, Transport).
  - **Payment Recording:** Record payments with backend validation rules against negative amounts and overpayments.

### 2. Business Logic & Payment Validation Rules
1. **Zero & Negative Amount Rejection:** Backend strictly rejects any payment where `amountPaid <= 0`.
2. **Overpayment Prevention:** The system checks previously recorded payments for the student and fee structure:
   $$\text{Pending Balance} = \text{Total Fee} - \sum \text{Previous Payments}$$
   Any payment where $\text{amountPaid} > \text{Pending Balance}$ is rejected with a descriptive error.
3. **Sequential Receipt Numbering:** Every payment receives a unique institutional receipt code (e.g., `RCP-2026-0001`).
4. **Print-Friendly Format:** Receipts include institution headers, student details, breakdown tables, transaction references, cashier signature lines, and `@media print` styles to hide all browser chrome.

---

## 📁 Repository Directory Structure

```
WEB_ASSIGNMENT-06/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB Atlas Mongoose connection
│   ├── controllers/
│   │   ├── authController.js     # User registration, login, profile, students list
│   │   ├── feeController.js      # Fee structure CRUD operations
│   │   └── paymentController.js  # Payment recording, receipt generation, analytics
│   ├── middleware/
│   │   └── auth.js               # JWT verification & role authorization (admin/student)
│   ├── models/
│   │   ├── User.js               # Student & Admin account schema
│   │   ├── FeeStructure.js       # Course fee structure & fee heads schema
│   │   └── Payment.js            # Payment records & receipt schema
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth routes
│   │   ├── feeRoutes.js          # /api/fees routes
│   │   └── paymentRoutes.js      # /api/payments routes
│   ├── .env.example              # Environment variables template
│   ├── package.json              # Backend dependencies & start scripts
│   ├── seed.js                   # Database initialization script with test data
│   └── server.js                 # Express app, CORS, health endpoint, port binding
│
├── frontend/
│   ├── public/                   # Static assets
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js         # Centralized API client (reads VITE_API_URL)
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Role-aware navigation header
│   │   │   ├── ProtectedRoute.jsx# Authentication & role guard
│   │   │   └── ReceiptView.jsx   # Printable institutional receipt component
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global session state & token persistence
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── Dashboard.jsx     # Analytics, payment modes & defaulters list
│   │   │   │   ├── FeeForm.jsx       # Add/Edit fee structure with fee heads builder
│   │   │   │   ├── FeesList.jsx      # Fee structures catalog & actions
│   │   │   │   └── RecordPayment.jsx # Payment entry with balance calculation
│   │   │   ├── Home.jsx              # Landing page with assignment info
│   │   │   ├── Login.jsx             # User login with quick-fill test credentials
│   │   │   ├── NotFound.jsx          # 404 handler
│   │   │   ├── ReceiptPage.jsx       # Individual receipt viewer (/receipts/:receiptNo)
│   │   │   ├── Register.jsx          # User registration (Student / Admin)
│   │   │   └── StudentFees.jsx       # Student fee summary & payment history
│   │   ├── App.jsx               # Route definitions
│   │   ├── index.css             # Design system & print stylesheet
│   │   └── main.jsx              # Vite React entry point
│   ├── .env.example              # Frontend environment variables template
│   ├── index.html                # HTML5 entry with Google Fonts & metadata
│   ├── package.json              # Frontend dependencies
│   ├── vercel.json               # SPA rewrite rule for React Router on Vercel
│   └── vite.config.js            # Vite configuration
│
├── .gitignore                    # Excludes node_modules, .env, and dist/
└── README.md                     # Documentation & deployment guide
```

---

## 🚀 Local Development Setup

### 1. Prerequisites
- **Node.js** (v18 or higher recommended; v26 supported)
- **Git**
- A **MongoDB Atlas** cluster connection URI (or local MongoDB)

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment configuration
cp .env.example .env
```

Configure `backend/.env` with your values:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/fee_management?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_2026
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

*(Optional) Populate the database with test students, fee structures, and payments:*
```bash
npm run seed
```

Start the backend server:
```bash
npm start
# Server will run on http://localhost:5000
# Test health endpoint at: http://localhost:5000/api/health
```

### 3. Frontend Setup
Open a new terminal window:
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment configuration
cp .env.example .env
```

Ensure `frontend/.env` contains:
```env
VITE_API_URL=http://localhost:5000
```

Start the Vite development server:
```bash
npm run dev
# Frontend runs on http://localhost:5173
```

---

## 🔑 Default Seed & Test Credentials

If you ran `npm run seed`, you can instantly sign in using:

| Role | Email | Password | Details |
|---|---|---|---|
| **Accountant / Admin** | `admin@college.edu` | `admin123` | Full administrative & payment collection access |
| **Student** | `student@college.edu` | `student123` | Rahul Sharma • B.Tech Computer Science |
| **Student (Defaulter)** | `aarav.verma@college.edu` | `student123` | Aarav Verma (Overdue Defaulter) |

---

## 📡 REST API Reference

### Authentication Routes (`/api/auth`)
- `POST /api/auth/register` — Register student or admin account
- `POST /api/auth/login` — Sign in and receive JWT token
- `GET /api/auth/me` — Retrieve logged-in user profile (Protected)
- `GET /api/auth/students` — Retrieve all students (Admin only)

### Fee Structure Routes (`/api/fees`)
- `GET /api/fees` — List all fee structures (Protected)
- `GET /api/fees/:id` — Get fee structure by ID (Protected)
- `POST /api/fees` — Create new fee structure with fee heads (Admin only)
- `PUT /api/fees/:id` — Update existing fee structure (Admin only)
- `DELETE /api/fees/:id` — Remove fee structure (Admin only)

### Payment & Receipt Routes (`/api/payments`)
- `GET /api/payments/dashboard` — Analytics stats, defaulters list, payment mode sums (Admin only)
- `POST /api/payments` — Record payment, validate balance, generate receipt (Admin only)
- `GET /api/payments/my-fees` — View logged-in student's fee summary and receipts (Student)
- `GET /api/payments/student/:studentId` — Inspect specific student fee summary (Admin only)
- `GET /api/payments/receipt/:receiptNo` — Retrieve receipt data by receipt number (Protected)

### System Health
- `GET /api/health` — Verifies server uptime, database connectivity, and deployment status

---

## ☁️ Deployment Instructions

### Part A: Deploying Backend to Render

1. Log in to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository: `your-username/fee-collection-system`.
4. Configure the Web Service settings:
   - **Name:** `fee-collection-api` (or your preferred name)
   - **Region:** Singapore / Oregon / Frankfurt
   - **Branch:** `main`
   - **Root Directory:** `backend` *(CRITICAL: Must specify backend folder)*
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Instance Type:** Free
5. In the **Environment Variables** section, add:
   - `NODE_ENV` = `production`
   - `PORT` = `10000` (Render assigns automatically, but backend listens to `process.env.PORT`)
   - `MONGO_URI` = *Your MongoDB Atlas connection string*
   - `JWT_SECRET` = *A strong random secret string*
   - `FRONTEND_URL` = `https://your-frontend.vercel.app` *(Can be updated after Vercel deployment)*
6. Click **Create Web Service**.
7. Once deployed, test your API health: `https://<YOUR-RENDER-SERVICE>.onrender.com/api/health`.

---

### Part B: Deploying Frontend to Vercel

1. Log in to your [Vercel Dashboard](https://vercel.com/).
2. Click **Add New...** → **Project**.
3. Import repository: `your-username/fee-collection-system`.
4. Configure the project:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click "Edit" and choose `frontend` *(CRITICAL)*
   - **Build Command:** `vite build` (default)
   - **Output Directory:** `dist` (default)
5. Under **Environment Variables**, add:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://<YOUR-RENDER-SERVICE>.onrender.com` *(Do NOT include trailing slash or `/api`)*
6. Click **Deploy**.
7. Once deployment finishes, copy your live Vercel URL (e.g. `https://web-assignment-06-xxxx.vercel.app`).
8. Return to Render Dashboard → Environment Variables → Set `FRONTEND_URL` to your Vercel URL so CORS allows all requests.

---

## 🏛️ System Information

- **Application:** FeeFlow Campus Fee Management System
- **Module:** Institutional Tuition Billing & Digital Receipt Clearance
- **Architecture:** MERN Full-Stack with Role-Based Access Control (Admin / Student)
