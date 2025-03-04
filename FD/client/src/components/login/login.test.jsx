// LoginPage.test.jsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from './login.jsx';
import AuthContext from '../context/authContext';
import '@testing-library/jest-dom';

// Mock navigate function
const mockNavigate = vi.fn();

// Mock react-router-dom's useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock fetch
global.fetch = vi.fn();

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

describe('LoginPage', () => {
  const mockLogin = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/login',
        reload: vi.fn(),
      },
      writable: true,
    });
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });
  
  const renderWithContext = (ui) => {
    return render(
      <AuthContext.Provider value={{ login: mockLogin }}>
        {ui}
      </AuthContext.Provider>
    );
  };
  
  it('renders login form correctly', () => {
    renderWithContext(<BrowserRouter><LoginPage /></BrowserRouter>);
    
    expect(screen.getByText(/brillian bank/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter Your Email Address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter Your Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });
  
  it('triggers page reload when path changes', () => {
    sessionStorageMock.getItem.mockImplementation((key) => {
      if (key === 'lastPath') return '/different-path';
      if (key === 'hasReloaded') return null;
      return null;
    });
    
    renderWithContext(<BrowserRouter><LoginPage /></BrowserRouter>);
    
    expect(sessionStorageMock.setItem).toHaveBeenCalledWith('lastPath', '/login');
    expect(sessionStorageMock.setItem).toHaveBeenCalledWith('hasReloaded', 'true');
    expect(window.location.reload).toHaveBeenCalled();
  });
  
  it('does not trigger reload when path is the same and already reloaded', () => {
    sessionStorageMock.getItem.mockImplementation((key) => {
      if (key === 'lastPath') return '/login';
      if (key === 'hasReloaded') return 'true';
      return null;
    });
    
    renderWithContext(<BrowserRouter><LoginPage /></BrowserRouter>);
    
    expect(window.location.reload).not.toHaveBeenCalled();
  });
  
  it('validates empty form fields', () => {
    renderWithContext(<BrowserRouter><LoginPage /></BrowserRouter>);
    
    // Get submit button and click it without filling fields
    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);
    
    // Fetch should not be called if fields are empty
    expect(global.fetch).not.toHaveBeenCalled();
  });
});