import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';

import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { StudentFees } from './pages/StudentFees';
import { ReceiptPage } from './pages/ReceiptPage';
import { Dashboard } from './pages/admin/Dashboard';
import { FeesList } from './pages/admin/FeesList';
import { FeeForm } from './pages/admin/FeeForm';
import { RecordPayment } from './pages/admin/RecordPayment';
import { NotFound } from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <div className="app-layout">
        <Navbar />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/my-fees"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentFees />
                </ProtectedRoute>
              }
            />

            <Route
              path="/receipts/:receiptNo"
              element={
                <ProtectedRoute>
                  <ReceiptPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/fees"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <FeesList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/fees/new"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <FeeForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/fees/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <FeeForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/payments/new"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <RecordPayment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/students/:id/fees"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <StudentFees />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <footer className="footer no-print">
          <div className="footer-content">
            <p>
              <strong>FeeFlow System</strong> • PS3: Fee Collection & Receipt Management System
            </p>
            <p className="footer-sub">
              Developed by <strong>Naman Goyal</strong> (Roll No: 53) • B.Tech Web Development Assignment 6
            </p>
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
}

export default App;
