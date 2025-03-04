import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import VendorDashboard from './vendorDashboard';

// Mock modules
import { useVendor } from '../../../hooks/useVendor';
import { useNotifications } from '../../../hooks/useNotifications';

// Mock the custom hooks
vi.mock('../../../hooks/useVendor');
vi.mock('../../../hooks/useNotifications');

// Mock the child components
vi.mock('../header/header', () => ({
  default: () => <div data-testid="mock-header">Header Mock</div>
}));

vi.mock('../sideBar/vendorSidebar', () => ({
  default: () => <div data-testid="mock-sidebar">Sidebar Mock</div>
}));

vi.mock('./vendorDisputeCard', () => ({
  default: ({ dispute, onClick }) => (
    <div 
      data-testid={`dispute-card-${dispute._id}`}
      onClick={() => onClick(dispute)}
    >
      {dispute.transactionId}
    </div>
  )
}));

vi.mock('./vendorDisputeModal', () => ({
  default: ({ show, dispute, onClose }) => 
    show ? (
      <div data-testid="dispute-modal">
        {dispute?.transactionId}
        <button onClick={onClose} data-testid="close-modal-btn">Close</button>
      </div>
    ) : null
}));

vi.mock('./notificationToast', () => ({
  default: () => <div data-testid="notification-toast">Notifications</div>
}));

vi.mock('./disputeHeader', () => ({
  default: ({ count }) => <div data-testid="dispute-header">Disputes: {count}</div>
}));

vi.mock('../../modals/sessionExpiredModal', () => ({
  default: () => <div data-testid="session-expired-modal">Session Expired</div>
}));

// Mock data
const mockDisputes = [
  { _id: '1', transactionId: 'TX001', amount: 100, status: 'pending' },
  { _id: '2', transactionId: 'TX002', amount: 200, status: 'pending' }
];

const mockUseVendor = {
  disputes: mockDisputes,
  loading: false,
  isPolling: false,
  vendorName: 'test vendor',
  sessionExpired: false,
  handleSessionExpired: vi.fn()
};

const mockUseNotifications = {
  notifications: [],
  addNotification: vi.fn()
};

describe('VendorDashboard Component', () => {
  beforeEach(() => {
    // Setup default mock implementations
    useVendor.mockReturnValue(mockUseVendor);
    useNotifications.mockReturnValue(mockUseNotifications);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  test('renders without crashing', () => {
    render(
      <BrowserRouter>
        <VendorDashboard />
      </BrowserRouter>
    );
  });

  test('renders loading state', () => {
    useVendor.mockReturnValue({
      ...mockUseVendor,
      loading: true
    });

    render(
      <BrowserRouter>
        <VendorDashboard />
      </BrowserRouter>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('renders header and sidebar', async () => {
    render(
      <BrowserRouter>
        <VendorDashboard />
      </BrowserRouter>
    );

    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-sidebar')).toBeInTheDocument();
  });

  test('displays vendor name correctly', async () => {
    render(
      <BrowserRouter>
        <VendorDashboard />
      </BrowserRouter>
    );

    expect(screen.getByText(/Vendor Portal - TEST VENDOR/i)).toBeInTheDocument();
  });

  test('renders dispute cards', async () => {
    render(
      <BrowserRouter>
        <VendorDashboard />
      </BrowserRouter>
    );

    expect(screen.getByText('TX001')).toBeInTheDocument();
    expect(screen.getByText('TX002')).toBeInTheDocument();
  });

  test('opens and closes dispute modal', async () => {
    render(
      <BrowserRouter>
        <VendorDashboard />
      </BrowserRouter>
    );

    // Open modal
    const disputeCard = screen.getByText('TX001');
    fireEvent.click(disputeCard);

    // Verify modal is shown
    await waitFor(() => {
      expect(screen.getByTestId('dispute-modal')).toBeInTheDocument();
    });

    // Close modal
    const closeButton = screen.getByTestId('close-modal-btn');
    fireEvent.click(closeButton);

    // Wait for animation timeout
    await waitFor(() => {
      expect(screen.queryByTestId('dispute-modal')).not.toBeInTheDocument();
    }, { timeout: 400 });
  });

  test('renders empty state when no disputes', async () => {
    useVendor.mockReturnValue({
      ...mockUseVendor,
      disputes: []
    });

    render(
      <BrowserRouter>
        <VendorDashboard />
      </BrowserRouter>
    );

    expect(screen.getByText(/You have no disputes to review at this time/i)).toBeInTheDocument();
  });

  test('shows session expired modal when session is expired', () => {
    useVendor.mockReturnValue({
      ...mockUseVendor,
      sessionExpired: true
    });

    render(
      <BrowserRouter>
        <VendorDashboard />
      </BrowserRouter>
    );

    expect(screen.getByTestId('session-expired-modal')).toBeInTheDocument();
  });
});