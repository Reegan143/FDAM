import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Dashboard from './Dashboard';
import { AuthContext } from '../context/authContext';
import { useDisputes } from '../../hooks/userDisputes';
import { useUser } from '../../hooks/useUser';

vi.mock('./header/header', () => ({
  default: () => <div data-testid="header">Header Component</div>,
}));

vi.mock('./sideBar/sidebar', () => ({
  default: () => <div data-testid="sidebar">Sidebar Component</div>,
}));

vi.mock('./disputeCard', () => ({
  default: ({ dispute, onClick }) => (
    <div 
      data-testid={`dispute-card-${dispute._id}`} 
      onClick={onClick}
    >
      Dispute Card
    </div>
  ),
}));

vi.mock('./disputeModal', () => ({
  default: ({ show, dispute, onClose }) => (
    show && (
      <div data-testid="dispute-modal">
        {dispute && <span>Dispute ID: {dispute._id}</span>}
        <button data-testid="close-modal" onClick={onClose}>Close</button>
      </div>
    )
  ),
}));

vi.mock('../modals/sessionExpiredModal', () => ({
  default: ({ show, onConfirm }) => (
    show && (
      <div data-testid="session-expired-modal">
        <button data-testid="confirm-session-expired" onClick={onConfirm}>Confirm</button>
      </div>
    )
  ),
}));

vi.mock('../chatbot/ChatBubble', () => ({
  default: () => <div data-testid="chat-bubble">Chat Bubble</div>,
}));

vi.mock('../../hooks/userDisputes', () => ({
  useDisputes: vi.fn(),
}));

vi.mock('../../hooks/useUser', () => ({
  useUser: vi.fn(),
}));

describe('Dashboard Component', () => {
  const mockToken = 'test-token';
  const mockDisputes = [
    { _id: '1', title: 'Dispute 1', description: 'Description 1' },
    { _id: '2', title: 'Dispute 2', description: 'Description 2' },
  ];
  
  const mockUserData = {
    loading: false,
    userName: 'John Doe',
    sessionExpired: false,
    handleSessionExpired: vi.fn(),
  };
  
  const mockDisputesData = {
    disputes: mockDisputes,
    loading: false,
  };

  const renderDashboard = (userDataOverride = {}, disputesDataOverride = {}) => {
    useUser.mockReturnValue({ ...mockUserData, ...userDataOverride });
    useDisputes.mockReturnValue({ ...mockDisputesData, ...disputesDataOverride });
    
    return render(
      <AuthContext.Provider value={{ token: mockToken }}>
        <Dashboard />
      </AuthContext.Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should render loading state when user data is loading', () => {
    renderDashboard({ loading: true });
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Welcome Back')).not.toBeInTheDocument();
  });

  it('should render loading state when disputes data is loading', () => {
    renderDashboard({}, { loading: true });
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Welcome Back')).not.toBeInTheDocument();
  });

  it('should render dashboard with correct user name', () => {
    renderDashboard();
    
    expect(screen.getByText('Welcome Back, John Doe!')).toBeInTheDocument();
    expect(screen.getByText('Welcome to your Brilliant Bank overview.')).toBeInTheDocument();
  });

  it('should render "User" as fallback when userName is not available', () => {
    renderDashboard({ userName: null });
    
    expect(screen.getByText('Welcome Back, User!')).toBeInTheDocument();
  });

  it('should render correct number of dispute cards', () => {
    renderDashboard();
    
    expect(screen.getByText('Your Disputes (2)')).toBeInTheDocument();
    expect(screen.getByTestId('dispute-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('dispute-card-2')).toBeInTheDocument();
  });

  it('should render empty disputes section when no disputes are available', () => {
    renderDashboard({}, { disputes: [] });
    
    expect(screen.getByText('Your Disputes (0)')).toBeInTheDocument();
    expect(screen.queryByTestId('dispute-card-1')).not.toBeInTheDocument();
  });

  it('should open dispute modal when a dispute card is clicked', async () => {
    renderDashboard();
    
    expect(screen.queryByTestId('dispute-modal')).not.toBeInTheDocument();
    
    fireEvent.click(screen.getByTestId('dispute-card-1'));
    
    expect(screen.getByTestId('dispute-modal')).toBeInTheDocument();
    expect(screen.getByText('Dispute ID: 1')).toBeInTheDocument();
  });

  it('should close dispute modal when close button is clicked', async () => {
    renderDashboard();
    
    fireEvent.click(screen.getByTestId('dispute-card-1'));
    expect(screen.getByTestId('dispute-modal')).toBeInTheDocument();
    
    fireEvent.click(screen.getByTestId('close-modal'));
    
    await waitFor(() => {
      expect(screen.queryByTestId('dispute-modal')).not.toBeInTheDocument();
    });
  });

  it('should render session expired modal when session is expired', () => {
    renderDashboard({ sessionExpired: true });
    
    expect(screen.getByTestId('session-expired-modal')).toBeInTheDocument();
  });

  it('should handle session expired confirmation', () => {
    renderDashboard({ sessionExpired: true });
    
    fireEvent.click(screen.getByTestId('confirm-session-expired'));
    
    expect(mockUserData.handleSessionExpired).toHaveBeenCalled();
  });

  it('should render all required components', () => {
    renderDashboard();
    
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('chat-bubble')).toBeInTheDocument();
  });

  it('should handle multiple dispute card clicks correctly', () => {
    renderDashboard();
    
    fireEvent.click(screen.getByTestId('dispute-card-1'));
    expect(screen.getByText('Dispute ID: 1')).toBeInTheDocument();
    
    fireEvent.click(screen.getByTestId('close-modal'));
    
    fireEvent.click(screen.getByTestId('dispute-card-2'));
    expect(screen.getByText('Dispute ID: 2')).toBeInTheDocument();
  });
});