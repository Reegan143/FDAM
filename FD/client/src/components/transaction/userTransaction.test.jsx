import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';

// Import the actual AuthContext
import AuthContext from '../context/authContext';

// Mock the entire axiosInstance module
vi.mock('../utils/axiosInstance', () => ({
  default: {
    utils: {
      get: vi.fn()
    }
  }
}));

// Mock child components
vi.mock('../dashboard/header/header', () => ({
  default: () => <div data-testid="mock-header">Header</div>
}));

vi.mock('../dashboard/sideBar/sidebar', () => ({
  default: () => <div data-testid="mock-sidebar">Sidebar</div>
}));

vi.mock('../chatbot/ChatBubble', () => ({
  default: () => <div data-testid="mock-chatbubble">ChatBubble</div>
}));

// Mock currency formatter
vi.mock('../utils/currencyFormatter', () => ({
  formatCurrency: (amount) => `$${amount}`
}));

// Import the component to test after mocks
import UserTransaction from './userTransaction';
import API from '../utils/axiosInstance';

// Mock React Router navigation
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({
      state: null
    })
  };
});

const mockTransactions = [
  {
    transactionId: '12345',
    transactionAmount: 1000,
    status: 'completed',
    senderName: 'John Doe',
    receiverName: 'Jane Smith',
    debitCardNumber: '**** **** **** 1234',
    transactionDate: '2024-03-04T10:00:00Z'
  },
  {
    transactionId: '67890',
    transactionAmount: 500,
    status: 'pending',
    senderName: 'Alice Johnson',
    receiverName: 'Bob Williams',
    debitCardNumber: '**** **** **** 5678',
    transactionDate: '2024-03-03T15:30:00Z'
  }
];

describe('UserTransaction Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();

    // Mock the API get method to return transactions
    vi.mocked(API.utils.get).mockResolvedValue({
      data: mockTransactions
    });
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <AuthContext.Provider value={{ token: 'test-token' }}>
          <UserTransaction />
        </AuthContext.Provider>
      </MemoryRouter>
    );
  };

  it('renders transactions table', async () => {
    renderComponent();

    // Wait for transactions to load
    await waitFor(() => {
      const johnDoeElements = screen.getAllByText('John Doe');
      expect(johnDoeElements.length).toBeGreaterThan(0);
      
      const aliceJohnsonElements = screen.getAllByText('Alice Johnson');
      expect(aliceJohnsonElements.length).toBeGreaterThan(0);
    });
  });

  

  it('handles API error', async () => {
    // Mock console error to prevent test output pollution
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Simulate API error
    vi.mocked(API.utils.get).mockRejectedValue(new Error('API Error'));

    renderComponent();

    // Wait and check for error logging
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching transactions:',
        expect.any(Error)
      );
    });

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  it('renders mobile view transaction cards', async () => {
    renderComponent();

    // Wait for transactions to load
    await waitFor(() => {
      const mobileCards = screen.getAllByText(/Transaction ID:/i);
      expect(mobileCards.length).toBeGreaterThan(0);
    });
  });
});