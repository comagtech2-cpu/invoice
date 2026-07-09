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
import ReceiptList from './components/ReceiptList';
import ReceiptDetail from './components/ReceiptDetail';
import Reports from './components/Reports';
import ClientList from './components/ClientList';
import ClientDetail from './components/ClientDetail';
import ClientForm from './components/ClientForm';
import TemplateList from './components/TemplateList';
import TemplateForm from './components/TemplateForm';
import TemplatePreview from './components/TemplatePreview';

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
          <Route path="/receipts" element={
            <ProtectedRoute>
              <ReceiptList />
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

          {/* Clients */}
          <Route path="/clients" element={
            <ProtectedRoute>
              <ClientList />
            </ProtectedRoute>
          } />
          <Route path="/clients/create" element={
            <ProtectedRoute>
              <ClientForm />
            </ProtectedRoute>
          } />
          <Route path="/clients/:id" element={
            <ProtectedRoute>
              <ClientDetail />
            </ProtectedRoute>
          } />
          <Route path="/clients/:id/edit" element={
            <ProtectedRoute>
              <ClientForm />
            </ProtectedRoute>
          } />

          {/* Templates */}
          <Route path="/templates" element={
            <ProtectedRoute>
              <TemplateList />
            </ProtectedRoute>
          } />
          <Route path="/templates/create" element={
            <ProtectedRoute>
              <TemplateForm />
            </ProtectedRoute>
          } />
          <Route path="/templates/:id" element={
            <ProtectedRoute>
              <TemplatePreview />
            </ProtectedRoute>
          } />
          <Route path="/templates/:id/edit" element={
            <ProtectedRoute>
              <TemplateForm />
            </ProtectedRoute>
          } />

          <Route path="/" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;