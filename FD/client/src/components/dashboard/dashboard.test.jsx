import React from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { AuthContext } from '../context/authContext';
import Dashboard from './dashboard';

// Mock all dependencies
vi.mock('./header/header', () => ({
  default: () => <div data-testid="mock-header">Header</div>
}));

vi.mock('./sideBar/sidebar', () => ({
  default: () => <div data-testid="mock-sidebar">Sidebar</div>
}));

vi.mock('./disputeCard', () => ({
  default: ({ dispute, onClick }) => (
    <div 
      data-testid={`mock-dispute-card-${dispute._id}`} 
      onClick={onClick}
    >
      Dispute Card {dispute.title}
    </div>
  )
}));

vi.mock('./disputeModal', () => ({
  default: ({ show, dispute, onClose }) => (
    show ? (
      <div data-testid="mock-dispute-modal">
        {dispute && <span>Modal for {dispute.title}</span>}
        <button onClick={onClose} data-testid="close-modal-btn">Close</button>
      </div>
    ) : null
  )
}));

vi.mock('../modals/sessionExpiredModal', () => ({
  default: ({ show, onConfirm }) => (
    show ? (
      <div data-testid="mock-session-expired-modal">
        <button onClick={onConfirm} data-testid="confirm-session-expired-btn">Confirm</button>
      </div>
    ) : null
  )
}));


vi.mock('../../hooks/userDisputes', () => ({
  useDisputes: vi.fn()
}));

vi.mock('../../hooks/useUser', () => ({
  useUser: vi.fn()
}));

import { useDisputes } from '../../hooks/userDisputes';
import { useUser } from '../../hooks/useUser';

describe('Dashboard Component', () => {
  const mockToken = 'fake-token-123';
  
  const mockDisputes = [
    { _id: '1', title: 'Dispute 1', description: 'Test description 1' },
    { _id: '2', title: 'Dispute 2', description: 'Test description 2' },
    { _id: '3', title: 'Dispute 3', description: 'Test description 3' }
  ];

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  it('should show loading state when user data is loading', () => {
    // Mock hooks to return loading state
    useUser.mockReturnValue({
      loading: true,
      userName: '',
      sessionExpired: false,
      handleSessionExpired: vi.fn()
    });
    
    useDisputes.mockReturnValue({
      disputes: [],
      loading: false
    });

    render(
      <AuthContext.Provider value={{ token: mockToken }}>
        <Dashboard />
      </AuthContext.Provider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should show loading state when disputes are loading', () => {
    // Mock hooks to return loading state
    useUser.mockReturnValue({
      loading: false,
      userName: 'John',
      sessionExpired: false,
      handleSessionExpired: vi.fn()
    });
    
    useDisputes.mockReturnValue({
      disputes: [],
      loading: true
    });

    render(
      <AuthContext.Provider value={{ token: mockToken }}>
        <Dashboard />
      </AuthContext.Provider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render the dashboard with disputes when data is loaded', () => {
    // Mock hooks to return successful data
    useUser.mockReturnValue({
      loading: false,
      userName: 'John Doe',
      sessionExpired: false,
      handleSessionExpired: vi.fn()
    });
    
    useDisputes.mockReturnValue({
      disputes: mockDisputes,
      loading: false
    });

    render(
      <AuthContext.Provider value={{ token: mockToken }}>
        <Dashboard />
      </AuthContext.Provider>
    );

    // Check header and welcome message
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByText('Welcome Back, John Doe!')).toBeInTheDocument();
    
    // Check disputes section and count
    expect(screen.getByText(`Your Disputes (${mockDisputes.length})`)).toBeInTheDocument();
    
    // Check each dispute card is rendered
    mockDisputes.forEach(dispute => {
      expect(screen.getByTestId(`mock-dispute-card-${dispute._id}`)).toBeInTheDocument();
    });
    
    // Check sidebar and chat bubble are rendered
    expect(screen.getByTestId('mock-sidebar')).toBeInTheDocument();
  });

  it('should open modal when dispute card is clicked', async () => {
    // Mock hooks
    useUser.mockReturnValue({
      loading: false,
      userName: 'John Doe',
      sessionExpired: false,
      handleSessionExpired: vi.fn()
    });
    
    useDisputes.mockReturnValue({
      disputes: mockDisputes,
      loading: false
    });

    render(
      <AuthContext.Provider value={{ token: mockToken }}>
        <Dashboard />
      </AuthContext.Provider>
    );

    // Click on a dispute card
    fireEvent.click(screen.getByTestId('mock-dispute-card-1'));
    
    // Check modal is displayed with correct dispute
    await waitFor(() => {
      expect(screen.getByTestId('mock-dispute-modal')).toBeInTheDocument();
      expect(screen.getByText('Modal for Dispute 1')).toBeInTheDocument();
    });
  });

  it('should close modal when close button is clicked', async () => {
    // Mock hooks
    useUser.mockReturnValue({
      loading: false,
      userName: 'John Doe',
      sessionExpired: false,
      handleSessionExpired: vi.fn()
    });
    
    useDisputes.mockReturnValue({
      disputes: mockDisputes,
      loading: false
    });

    render(
      <AuthContext.Provider value={{ token: mockToken }}>
        <Dashboard />
      </AuthContext.Provider>
    );

    // Open modal
    fireEvent.click(screen.getByTestId('mock-dispute-card-1'));
    
    // Check modal is displayed
    await waitFor(() => {
      expect(screen.getByTestId('mock-dispute-modal')).toBeInTheDocument();
    });
    
    // Close modal
    fireEvent.click(screen.getByTestId('close-modal-btn'));
    
    // Check modal is not displayed anymore
    await waitFor(() => {
      expect(screen.queryByTestId('mock-dispute-modal')).not.toBeInTheDocument();
    });
  });

  it('should show session expired modal when session is expired', () => {
    const handleSessionExpiredMock = vi.fn();
    
    // Mock hooks to show session expired
    useUser.mockReturnValue({
      loading: false,
      userName: 'John Doe',
      sessionExpired: true,
      handleSessionExpired: handleSessionExpiredMock
    });
    
    useDisputes.mockReturnValue({
      disputes: mockDisputes,
      loading: false
    });

    render(
      <AuthContext.Provider value={{ token: mockToken }}>
        <Dashboard />
      </AuthContext.Provider>
    );

    // Check session expired modal is shown
    expect(screen.getByTestId('mock-session-expired-modal')).toBeInTheDocument();
    
    // Click confirm on session expired modal
    fireEvent.click(screen.getByTestId('confirm-session-expired-btn'));
    
    // Check handler was called
    expect(handleSessionExpiredMock).toHaveBeenCalledTimes(1);
  });

  it('should handle empty disputes array', () => {
    // Mock hooks with empty disputes
    useUser.mockReturnValue({
      loading: false,
      userName: 'John Doe',
      sessionExpired: false,
      handleSessionExpired: vi.fn()
    });
    
    useDisputes.mockReturnValue({
      disputes: [],
      loading: false
    });

    render(
      <AuthContext.Provider value={{ token: mockToken }}>
        <Dashboard />
      </AuthContext.Provider>
    );

    // Check disputes count shows zero
    expect(screen.getByText('Your Disputes (0)')).toBeInTheDocument();
    
    // Make sure no dispute cards are rendered
    mockDisputes.forEach(dispute => {
      expect(screen.queryByTestId(`mock-dispute-card-${dispute._id}`)).not.toBeInTheDocument();
    });
  });

  it('should pass token to hooks correctly', () => {
    // Mock hooks
    useUser.mockReturnValue({
      loading: false,
      userName: 'John Doe',
      sessionExpired: false,
      handleSessionExpired: vi.fn()
    });
    
    useDisputes.mockReturnValue({
      disputes: mockDisputes,
      loading: false
    });

    render(
      <AuthContext.Provider value={{ token: mockToken }}>
        <Dashboard />
      </AuthContext.Provider>
    );

    // Verify hooks were called with the token
    expect(useUser).toHaveBeenCalledWith(mockToken);
    expect(useDisputes).toHaveBeenCalledWith(mockToken);
  });
});