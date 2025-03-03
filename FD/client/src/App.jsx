import './App.css';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './components/context/authContext';

// Pages
import HomePage from './components/home/home';
import LoginPage from './components/login/login';
import Signup from './components/signup/signup';
import Dashboard from './components/dashboard/dashboard';
import DisputesForm from './components/disputes/disputes';
import ResetPasswordRequest from './components/resetPassword/resetPasswordRequest';
import ResetPasswordForm from './components/resetPassword/resetForm';
import DisputeStatus from './components/disputeStatus';
import Notifications from './components/notification/notification';
import UserSettings from './components/settings/settings';
import UserTransaction from './components/transaction/userTransaction';
import AdminDashboard from './components/dashboard/admin/adminDashboard';
import VendorDashboard from './components/dashboard/vendor/vendorDashboard';
import VendorTransaction from './components/transaction/vendorTransaction';
import ApiKeys from './components/apiKeys/vendorApiKeys';
import APIKeyRequests from './components/requestApi/adminRequestApi';

// Protected Route Components
const ProtectedRoute = ({ children }) => {
  const { getToken } = useContext(AuthContext);
  const location = useLocation();
  const token = getToken();

  if (!token) {
    // Redirect to login while saving the attempted path
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Signup />} />
        <Route path="/reset-password" element={<ResetPasswordRequest />} />
        <Route path="/reset-password-form" element={<ResetPasswordForm />} />

        {/* Protected User Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard title="User Dashboard" />
          </ProtectedRoute>
        } />
        <Route path="/disputeform" element={
          <ProtectedRoute>
            <DisputesForm />
          </ProtectedRoute>
        } />
        <Route path="/dispute-status" element={
          <ProtectedRoute>
            <DisputeStatus />
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        } />
        <Route path="/user/settings" element={
          <ProtectedRoute>
            <UserSettings />
          </ProtectedRoute>
        } />
        <Route path="/user/transactions" element={
          <ProtectedRoute>
            <UserTransaction />
          </ProtectedRoute>
        } />

        {/* Protected Admin Routes */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/api-key-request" element={
          <ProtectedRoute>
            <APIKeyRequests />
          </ProtectedRoute>
        } />

        {/* Protected Vendor Routes */}
        <Route path="/vendor/dashboard" element={
          <ProtectedRoute>
            <VendorDashboard />
          </ProtectedRoute>
        } />
        <Route path="/vendor/transactions" element={
          <ProtectedRoute>
            <VendorTransaction />
          </ProtectedRoute>
        } />

        <Route path="/vendor/api-keys" element={
          <ProtectedRoute>
            <ApiKeys />
          </ProtectedRoute>
        } />

        {/* Catch all route for 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;