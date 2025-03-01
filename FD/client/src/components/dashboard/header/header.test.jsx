import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import Header from './header';
import AuthContext from '../../context/authContext';
import API from '../../utils/axiosInstance';

// Mock dependencies
vi.mock('../../utils/axiosInstance', () => ({
  default: {
    utils: {
      get: vi.fn(),
      patch: vi.fn()
    }
  }
}));

// Mock react-router-dom
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: vi.fn()
  };
});

const renderComponent = (contextValue = {}) => {
  const defaultContextValue = {
    logout: vi.fn(),
    token: 'test-token',
    ...contextValue
  };

  return render(
    <MemoryRouter>
      <AuthContext.Provider value={defaultContextValue}>
        <Header />
      </AuthContext.Provider>
    </MemoryRouter>
  );
};

describe('Header Component', () => {
  beforeEach(() => {
    // Setup default mock for useNavigate
    useNavigate.mockReturnValue(vi.fn());
    
    // Setup default mock for API
    vi.mocked(API.utils.get).mockResolvedValue({
      data: [
        { _id: '1', isRead: false, message: 'Test Notification 1' },
        { _id: '2', isRead: false, message: 'Test Notification 2' }
      ]
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Rendering Tests
  it('renders logo and brand name', () => {
    renderComponent();
    
    expect(screen.getByAltText('Brillian Bank')).toBeInTheDocument();
    expect(screen.getByText('Brillian Bank')).toBeInTheDocument();
  });

  // Navigation Tests
  it('navigates to home on logo click', () => {
    const mockNavigate = vi.fn();
    useNavigate.mockReturnValue(mockNavigate);
    
    renderComponent();
    
    fireEvent.click(screen.getByText('Brillian Bank'));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  // Logout Tests
  it('calls logout and navigates to login when logout button is clicked', () => {
    const mockLogout = vi.fn();
    const mockNavigate = vi.fn();
    
    useNavigate.mockReturnValue(mockNavigate);
    
    renderComponent({ logout: mockLogout });
    
    fireEvent.click(screen.getByText('Logout'));
    
    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  // Notifications Tests
  it('fetches notifications on mount', async () => {
    renderComponent();

    await waitFor(() => {
      expect(API.utils.get).toHaveBeenCalledWith('/notifications');
    });
  });

  it('displays unread notifications count', async () => {
    renderComponent();

    await waitFor(() => {
      const badge = screen.getByText('2');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('badge', 'rounded-pill', 'bg-danger');
    });
  });

  // Settings Navigation Test
  it('navigates to settings page when settings button is clicked', () => {
    const mockNavigate = vi.fn();
    useNavigate.mockReturnValue(mockNavigate);

    renderComponent();

    fireEvent.click(screen.getByTestId('settings-button'));
    expect(mockNavigate).toHaveBeenCalledWith('/user/settings');
  });

  // Notification Interaction Test
  it('toggles notifications popup', async () => {
    renderComponent();

    const notificationToggle = screen.getByTestId('notification-toggle');
    fireEvent.click(notificationToggle);

  });
});