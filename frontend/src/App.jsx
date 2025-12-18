import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './components/Dashboard';
import BusinessProfile from './components/BusinessProfile';
import CreateInvoice from './components/CreateInvoice';
import InvoiceList from './components/InvoiceList';
import InvoiceDetail from './components/InvoiceDetail';
import ReceiptDetail from './components/ReceiptDetail';
import Reports from './components/Reports';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/business-profile" element={
            <ProtectedRoute>
              <BusinessProfile />
            </ProtectedRoute>
          } />
          <Route path="/invoices" element={
            <ProtectedRoute>
              <InvoiceList />
            </ProtectedRoute>
          } />
          <Route path="/invoices/create" element={
            <ProtectedRoute>
              <CreateInvoice />
            </ProtectedRoute>
          } />
          <Route path="/invoices/:id" element={
            <ProtectedRoute>
              <InvoiceDetail />
            </ProtectedRoute>
          } />
          <Route path="/receipts/:id" element={
            <ProtectedRoute>
              <ReceiptDetail />
            </ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          } />
          <Route path="/" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;