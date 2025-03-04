import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DisputesForm from './disputes';

// Mocking dependencies (same as previous example)
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ 
      state: {
        transactionId: '1234567890',
        debitCardNumber: '1234567890123456'
      } 
    }),
    MemoryRouter: actual.MemoryRouter
  };
});

vi.mock('../utils/axiosInstance', () => ({
  default: {
    user: {
      get: vi.fn().mockResolvedValue({
        data: {
          userName: 'Test User',
          cuid: '12345',
          accNo: '67890',
          branchCode: 'BR001',
          branchName: 'Test Branch',
          email: 'test@example.com'
        }
      })
    },
    utils: {
      post: vi.fn().mockResolvedValue({ data: { message: 'Dispute submitted successfully' } })
    }
  }
}));

// Mock child components
vi.mock('../dashboard/header/header', () => ({
  default: () => <div>Raise Disputes</div>
}));

vi.mock('../dashboard/sideBar/sidebar', () => ({
  default: () => <div>Sidebar</div>
}));



describe('DisputesForm Component', () => {
  

 

  it('has submit button', () => {
    render(
      <MemoryRouter>
        <DisputesForm />
      </MemoryRouter>
    );

    // Check for submit button
    const submitButton = screen.getByRole('button', { name: /Submit/i });
    expect(submitButton).toBeInTheDocument();
  });
});