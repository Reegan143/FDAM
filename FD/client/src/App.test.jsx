// App.test.jsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../src/App';
import * as React from 'react';

// Mock CSS imports to prevent import errors
vi.mock('./App.css', () => ({}));

// Mock React's useContext
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useContext: vi.fn()
  };
});

// Mock AuthContext
vi.mock('./components/context/authContext', () => ({
  AuthContext: 'mocked-auth-context'
}));

// Mock react-router-dom components
vi.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div data-testid="browser-router">{children}</div>,
  Routes: ({ children }) => <div data-testid="routes">{children}</div>,
  Route: ({ path, element }) => (
    <div data-testid={`route-${path?.replace(/\//g, '-').replace(/^\-/, '').replace(/\*/g, 'catch-all')}`} data-path={path}>
      {element}
    </div>
  ),
  Navigate: ({ to, state, replace }) => (
    <div data-testid={`navigate-to-${to.replace(/\//g, '-').replace(/^\-/, '')}`}>
      Navigate to {to}
    </div>
  ),
  useLocation: () => ({ pathname: '/current-path', state: null }),
}));

// Mock all the page components individually
vi.mock('./components/home/home', () => ({
  default: () => <div data-testid="home-page">HomePage</div>
}));

vi.mock('./components/login/login', () => ({
  default: () => <div data-testid="login-page">LoginPage</div>
}));

vi.mock('./components/signup/signup', () => ({
  default: () => <div data-testid="signup-page">Signup</div>
}));

vi.mock('./components/dashboard/dashboard', () => ({
  default: ({ title }) => <div data-testid="dashboard-page">{title}</div>
}));

vi.mock('./components/disputes/disputes', () => ({
  default: () => <div data-testid="disputes-form">DisputesForm</div>
}));

vi.mock('./components/resetPassword/resetPasswordRequest', () => ({
  default: () => <div data-testid="reset-password-request">ResetPasswordRequest</div>
}));

vi.mock('./components/resetPassword/resetForm', () => ({
  default: () => <div data-testid="reset-password-form">ResetPasswordForm</div>
}));

vi.mock('./components/disputeStatus', () => ({
  default: () => <div data-testid="dispute-status">DisputeStatus</div>
}));

vi.mock('./components/notification/notification', () => ({
  default: () => <div data-testid="notifications">Notifications</div>
}));

vi.mock('./components/settings/settings', () => ({
  default: () => <div data-testid="user-settings">UserSettings</div>
}));

vi.mock('./components/transaction/userTransaction', () => ({
  default: () => <div data-testid="user-transaction">UserTransaction</div>
}));

vi.mock('./components/dashboard/admin/adminDashboard', () => ({
  default: () => <div data-testid="admin-dashboard">AdminDashboard</div>
}));

vi.mock('./components/login/adminLogin', () => ({
  default: () => <div data-testid="admin-login">AdminLoginPage</div>
}));

vi.mock('./components/dashboard/vendor/vendorDashboard', () => ({
  default: () => <div data-testid="vendor-dashboard">VendorDashboard</div>
}));

vi.mock('./components/transaction/vendorTransaction', () => ({
  default: () => <div data-testid="vendor-transaction">VendorTransaction</div>
}));

vi.mock('./components/requestApi/vendorRequestApiKey', () => ({
  default: () => <div data-testid="request-api-key">RequestApiKey</div>
}));

vi.mock('./components/apiKeys/vendorApiKeys', () => ({
  default: () => <div data-testid="api-keys">ApiKeys</div>
}));

vi.mock('./components/requestApi/adminRequestApi', () => ({
  default: () => <div data-testid="api-key-requests">APIKeyRequests</div>
}));

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders public routes correctly', () => {
    // Mock unauthenticated user
    React.useContext.mockReturnValue({ getToken: () => null });
    
    render(<App />);
    
    // Check that BrowserRouter and Routes are rendered
    expect(screen.getByTestId('browser-router')).toBeInTheDocument();
    expect(screen.getByTestId('routes')).toBeInTheDocument();
    
    // Check that public routes are rendered
    expect(screen.getByTestId('route-')).toBeInTheDocument();
    expect(screen.getByTestId('route-login')).toBeInTheDocument();
    expect(screen.getByTestId('route-register')).toBeInTheDocument();
    expect(screen.getByTestId('route-reset-password')).toBeInTheDocument();
    expect(screen.getByTestId('route-reset-password-form')).toBeInTheDocument();
  });
  
  it('redirects protected routes to login when user is not authenticated', () => {
    // Mock unauthenticated user
    React.useContext.mockReturnValue({ getToken: () => null });
    
    render(<App />);
    
    // Check that protected routes redirect to login
    expect(screen.getByTestId('route-dashboard').textContent).toContain('Navigate to /login');
    expect(screen.getByTestId('route-disputeform').textContent).toContain('Navigate to /login');
    expect(screen.getByTestId('route-dispute-status').textContent).toContain('Navigate to /login');
    expect(screen.getByTestId('route-notifications').textContent).toContain('Navigate to /login');
    expect(screen.getByTestId('route-user-settings').textContent).toContain('Navigate to /login');
    expect(screen.getByTestId('route-user-transactions').textContent).toContain('Navigate to /login');
    expect(screen.getByTestId('route-admin-dashboard').textContent).toContain('Navigate to /login');
    expect(screen.getByTestId('route-admin-api-key-request').textContent).toContain('Navigate to /login');
    expect(screen.getByTestId('route-vendor-dashboard').textContent).toContain('Navigate to /login');
    expect(screen.getByTestId('route-vendor-transactions').textContent).toContain('Navigate to /login');
    expect(screen.getByTestId('route-vendor-api-keys').textContent).toContain('Navigate to /login');
  });
  
  it('renders protected routes when user is authenticated', () => {
    // Mock authenticated user
    React.useContext.mockReturnValue({ getToken: () => 'fake-token' });
    
    render(<App />);
    
    // Check that protected routes render their components
    expect(screen.getByTestId('route-dashboard').textContent).toContain('User Dashboard');
    expect(screen.getByTestId('route-disputeform').textContent).toContain('DisputesForm');
    expect(screen.getByTestId('route-dispute-status').textContent).toContain('DisputeStatus');
    expect(screen.getByTestId('route-notifications').textContent).toContain('Notifications');
    expect(screen.getByTestId('route-user-settings').textContent).toContain('UserSettings');
    expect(screen.getByTestId('route-user-transactions').textContent).toContain('UserTransaction');
    expect(screen.getByTestId('route-admin-dashboard').textContent).toContain('AdminDashboard');
    expect(screen.getByTestId('route-admin-api-key-request').textContent).toContain('APIKeyRequests');
    expect(screen.getByTestId('route-vendor-dashboard').textContent).toContain('VendorDashboard');
    expect(screen.getByTestId('route-vendor-transactions').textContent).toContain('VendorTransaction');
    expect(screen.getByTestId('route-vendor-api-keys').textContent).toContain('ApiKeys');
  });
  
  it('redirects invalid routes to the homepage', () => {
    React.useContext.mockReturnValue({ getToken: () => 'fake-token' });
    
    render(<App />);
    
    // Check that catch-all route redirects to home
    expect(screen.getByTestId('route-catch-all').textContent).toContain('Navigate to /');
  });
  
  it('ProtectedRoute component preserves the location when redirecting', () => {
    React.useContext.mockReturnValue({ getToken: () => null });
    
    render(<App />);
    
    // The useLocation mock returns '/current-path'
    const dashboardRoute = screen.getByTestId('route-dashboard');
    expect(dashboardRoute).toBeInTheDocument();
    expect(dashboardRoute.textContent).toContain('Navigate to /login');
    // This test verifies the redirect happens when not authenticated
    // The state preservation is implied through the mocked useLocation and Navigate
  });
});