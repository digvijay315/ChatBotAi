import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppContextProvider } from './context/AppContext';
import ProtectedRoute from './components/ProtectedRoute';
import AuthPage from './pages/AuthPage';
import ChatDashboardPage from './pages/ChatDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

export default function App() {
  return (
    <AppContextProvider>
      <BrowserRouter>
        <Routes>
          {/* Unprotected Route: Registration & Login Tabs */}
          <Route path="/auth" element={<AuthPage />} />

          {/* Unprotected Route: Devotee Chat Area (Devotee & Admins allowed) */}
          <Route path="/" element={<ChatDashboardPage />} />

          {/* Protected Route: Temple Details Admin Panel (Strictly Admin only) */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute role="admin">
                <AdminDashboardPage />
              </ProtectedRoute>
            } 
          />

          {/* Catch-all Route: Redirect unknown pages back to index */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppContextProvider>
  );
}
