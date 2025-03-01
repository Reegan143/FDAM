import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import axios from 'axios';
import AdminDashboard from './adminDashboard';
import { AuthContext } from '../../context/authContext';
import API from "../../utils/axiosInstance";

// Mock dependencies
vi.mock('../../utils/axiosInstance', () => ({
  default: {
    admin: {
      get: vi.fn(),
      patch: vi.fn(),
    }
  },
  setAuthToken: vi.fn()
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('AdminDashboard Component', () => {
  const mockToken = 'test-token';
  
  const mockAdminData = { 
    userName: 'AdminUser' 
  };

  const mockDisputes = [
    {
      _id: '1',
      ticketNumber: '123',
      email: 'user1@example.com',
      amount: 1000,
      complaintType: 'Fraud',
      createdAt: '2024-01-01T12:00:00Z',
      status: 'submitted',
      transactionId: 'T001',
      description: 'Unauthorized transaction',
      digitalChannel: 'Online',
      debitCardNumber: '**** **** **** 1234',
      cardType: 'Debit',
      vendorName: 'Test Vendor'
    },
    {
      _id: '2',
      ticketNumber: '456',
      email: 'user2@example.com',
      amount: 2000,
      complaintType: 'Chargeback',
      createdAt: '2024-02-01T12:00:00Z',
      status: 'closed',
      transactionId: 'T002',
      description: 'Disputed charge',
      digitalChannel: 'Mobile',
      debitCardNumber: '**** **** **** 5678',
      cardType: 'Credit',
      vendorName: 'Another Vendor'
    }
  ];

  const mockTransactionData = {
    transactionId: 'T001',
    amount: 1000,
    status: 'completed'
  };

  const renderComponent = () => {
    return render(
      <AuthContext.Provider value={{ token: mockToken }}>
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      </AuthContext.Provider>
    );
  };

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Mock API calls
    API.admin.get.mockImplementation((url) => {
      if (url === '/admin/me') {
        return Promise.resolve({ data: mockAdminData });
      }
      if (url === '/admin/disputes') {
        return Promise.resolve({ data: mockDisputes });
      }
      if (url.startsWith('/admin/transaction/')) {
        return Promise.resolve({ data: mockTransactionData });
      }
      throw new Error('Not found');
    });
  });

  it('renders admin dashboard with disputes', async () => {
    renderComponent();

    // Wait for admin data and disputes to load
    await waitFor(() => {
      expect(screen.getByText(/Admin Portal - AdminUser!/i)).toBeInTheDocument();
      expect(screen.getByText(/All Disputes \(2\)/i)).toBeInTheDocument();
    });

    // Check dispute cards are rendered
    expect(screen.getByText(/Ticket #123/i)).toBeInTheDocument();
    expect(screen.getByText(/Ticket #456/i)).toBeInTheDocument();
  });

  it('opens dispute modal when dispute card is clicked', async () => {
    renderComponent();

    // Wait for disputes to load
    await waitFor(() => {
      expect(screen.getByText(/Ticket #123/i)).toBeInTheDocument();
    });

    // Click on dispute card
    const disputeCard = screen.getByText(/Ticket #123/i);
    fireEvent.click(disputeCard);

    // Check modal is opened
    await waitFor(() => {
      expect(screen.getByText(/Dispute Details/i)).toBeInTheDocument();
      expect(screen.getByText(/User Information/i)).toBeInTheDocument();
    });
  });

  it('updates dispute status', async () => {
    renderComponent();

    // Wait for disputes to load
    await waitFor(() => {
      expect(screen.getByText(/Ticket #123/i)).toBeInTheDocument();
    });

    // Click on dispute card
    const disputeCard = screen.getByText(/Ticket #123/i);
    fireEvent.click(disputeCard);

    // Wait for modal to open
    await waitFor(() => {
      expect(screen.getByText(/Dispute Details/i)).toBeInTheDocument();
    });

    // Mock patch request
    API.admin.patch.mockResolvedValue({});

    // Approve dispute
    const approveButton = screen.getByText(/Approve/i);
    fireEvent.click(approveButton);

    // Check API was called with correct parameters
    await waitFor(() => {
      expect(API.admin.patch).toHaveBeenCalledWith('/admin/dispute-status', {
        disputeId: '1',
        status: 'approved',
        remarks: ''
      });
    });
  });

  it('views transaction details', async () => {
    renderComponent();

    // Wait for disputes to load
    await waitFor(() => {
      expect(screen.getByText(/Ticket #123/i)).toBeInTheDocument();
    });

    // Click on dispute card
    const disputeCard = screen.getByText(/Ticket #123/i);
    fireEvent.click(disputeCard);

    // Wait for modal to open
    await waitFor(() => {
      expect(screen.getByText(/Dispute Details/i)).toBeInTheDocument();
    });

    // Click view transaction button
    const viewTransactionButton = screen.getByText(/Check Transaction Details/i);
    fireEvent.click(viewTransactionButton);

    // Check transaction view is rendered
    await waitFor(() => {
      expect(API.admin.get).toHaveBeenCalledWith('/admin/transaction/T001');
    });
  });

  it('handles search and sorting', async () => {
    renderComponent();

    // Wait for disputes to load
    await waitFor(() => {
      expect(screen.getByText(/Ticket #123/i)).toBeInTheDocument();
    });

    // Find search input and sort dropdown
    const searchInput = screen.getByPlaceholderText(/Search by user's email/i);
    const sortDropdown = screen.getByRole('combobox');

    // Test search
    fireEvent.change(searchInput, { target: { value: 'user1@example.com' } });
    expect(searchInput.value).toBe('user1@example.com');

    // Test sorting
    fireEvent.change(sortDropdown, { target: { value: 'amount_desc' } });
    expect(sortDropdown.value).toBe('amount_desc');
  });
});