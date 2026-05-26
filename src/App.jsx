/**
 * App.jsx
 * Routeur principal de l'application.
 * Définit toutes les routes et applique la protection par rôle.
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import ProtectedRoute from './components/common/ProtectedRoute'

// Pages publiques
import LoginWorker from './pages/LoginWorker'
import LoginClient from './pages/LoginClient'

// Pages Worker
import WorkerDashboard from './pages/worker/WorkerDashboard'
import WorkerSales     from './pages/worker/WorkerSales'
import WorkerInvoices  from './pages/worker/WorkerInvoices'
import WorkerStock     from './pages/worker/WorkerStock'

// Pages Client
import ClientDashboard from './pages/client/ClientDashboard'
import ClientWorkers   from './pages/client/ClientWorkers'
import ClientProducts  from './pages/client/ClientProducts'
import ClientDiscounts from './pages/client/ClientDiscounts'
import ClientSales     from './pages/client/ClientSales'
import ClientInvoices  from './pages/client/ClientInvoices'
import ClientReports   from './pages/client/ClientReports'

const App = () => (
  <BrowserRouter>
    {/* Notifications toast globales */}
    <ToastContainer
      position="top-right"
      autoClose={3500}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      pauseOnHover
      draggable
      theme="light"
    />

    <Routes>
      {/* ── Publiques ── */}
      <Route path="/login-worker" element={<LoginWorker />} />
      <Route path="/login-client" element={<LoginClient />} />

      {/* ── Redirection racine ── */}
      <Route path="/" element={<Navigate to="/login-worker" replace />} />

      {/* ── Routes Worker ── */}
      <Route path="/worker/dashboard" element={
        <ProtectedRoute allowedRoles={['worker']}>
          <WorkerDashboard />
        </ProtectedRoute>
      } />
      <Route path="/worker/sales" element={
        <ProtectedRoute allowedRoles={['worker']}>
          <WorkerSales />
        </ProtectedRoute>
      } />
      <Route path="/worker/invoices" element={
        <ProtectedRoute allowedRoles={['worker']}>
          <WorkerInvoices />
        </ProtectedRoute>
      } />
      <Route path="/worker/stock" element={
        <ProtectedRoute allowedRoles={['worker']}>
          <WorkerStock />
        </ProtectedRoute>
      } />

      {/* ── Routes Client / Super Admin ── */}
      <Route path="/client/dashboard" element={
        <ProtectedRoute allowedRoles={['client','super_admin']}>
          <ClientDashboard />
        </ProtectedRoute>
      } />
      <Route path="/client/workers" element={
        <ProtectedRoute allowedRoles={['client','super_admin']}>
          <ClientWorkers />
        </ProtectedRoute>
      } />
      <Route path="/client/products" element={
        <ProtectedRoute allowedRoles={['client','super_admin']}>
          <ClientProducts />
        </ProtectedRoute>
      } />
      <Route path="/client/discounts" element={
        <ProtectedRoute allowedRoles={['client','super_admin']}>
          <ClientDiscounts />
        </ProtectedRoute>
      } />
      <Route path="/client/sales" element={
        <ProtectedRoute allowedRoles={['client','super_admin']}>
          <ClientSales />
        </ProtectedRoute>
      } />
      <Route path="/client/invoices" element={
        <ProtectedRoute allowedRoles={['client','super_admin']}>
          <ClientInvoices />
        </ProtectedRoute>
      } />
      <Route path="/client/reports" element={
        <ProtectedRoute allowedRoles={['client','super_admin']}>
          <ClientReports />
        </ProtectedRoute>
      } />

      {/* ── Fallback 404 ── */}
      <Route path="*" element={<Navigate to="/login-worker" replace />} />
    </Routes>
  </BrowserRouter>
)

export default App
