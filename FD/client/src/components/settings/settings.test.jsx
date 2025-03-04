import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import UserSettings from './settings';
import API from '../utils/axiosInstance';

// Mock dependencies
vi.mock('../utils/axiosInstance', () => ({
  default: {
    utils: {
      get: vi.fn(),
    }
  }
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockUserData = {
  userName: 'John Doe',
  email: 'john@example.com',
  accNo: '1234567890',
  cuid: 'CUST001',
  branchCode: 'BR001',
  branchName: 'Main Branch',
  debitCardNumber: '1234-5678-9012-3456',
  role: 'Customer'
};

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <UserSettings />
    </BrowserRouter>
  );
};

describe('UserSettings Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders user profile loading state', () => {
    // Create a pending promise to simulate loading
    const loadingPromise = new Promise(() => {});
    API.utils.get.mockReturnValue(loadingPromise);

    renderComponent();

    const loadingSpinner = screen.getByText((content, element) => {
      return element.classList.contains('animate-spin');
    });
    expect(loadingSpinner).toBeInTheDocument();
  });

  it('renders user profile details', async () => {
    API.utils.get.mockResolvedValue({ data: mockUserData });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('User Profile')).toBeInTheDocument();
      expect(screen.getByText(mockUserData.userName)).toBeInTheDocument();
      expect(screen.getByText(mockUserData.email)).toBeInTheDocument();
    });
  });

  it('handles go back navigation', async () => {
    API.utils.get.mockResolvedValue({ data: mockUserData });

    renderComponent();

    await waitFor(() => {
      const goBackButton = screen.getByText('Go Back');
      goBackButton.click();
      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });
  });
});