import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { vi } from 'vitest';
import DisputeCard from './adminDisputeCard';
import { formatCurrency } from '../../utils/currencyFormatter';
import { formatDate } from '../../utils/dateFormates';

// Mock utility functions
vi.mock('../../utils/currencyFormatter', () => ({
  formatCurrency: vi.fn((amount) => `$${amount}`)
}));

vi.mock('../../utils/dateFormates', () => ({
  formatDate: vi.fn((date) => new Date(date).toLocaleDateString())
}));

describe('DisputeCard Component', () => {
  const mockDispute = {
    _id: '1',
    ticketNumber: '123',
    email: 'user@example.com',
    amount: 1000,
    complaintType: 'Fraud',
    createdAt: '2024-01-01T12:00:00Z',
    status: 'submitted',
  };

  const mockOnClick = vi.fn();

  const renderComponent = (dispute = mockDispute) => {
    return render(
      <DisputeCard 
        dispute={dispute} 
        onClick={mockOnClick} 
      />
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dispute card with correct information', () => {
    const { container } = renderComponent();

    // Find the card element
    const cardElement = container.querySelector('.card');
    expect(cardElement).toBeInTheDocument();

    // Use within to scope our queries
    const withinCard = within(cardElement);

    // Check ticket number
    expect(withinCard.getByText(/Ticket #123/i)).toBeInTheDocument();

    // Check user email
    const userEmailElements = withinCard.getAllByText(/user@example.com/i);
    expect(userEmailElements.length).toBeGreaterThan(0);

    // Check amount
    const amountElements = withinCard.getAllByText(/\$1000/i);
    expect(amountElements.length).toBeGreaterThan(0);

    // Check complaint type
    const typeElements = withinCard.getAllByText(/Fraud/i);
    expect(typeElements.length).toBeGreaterThan(0);

    // Check date
    const dateElements = withinCard.getAllByText(/1\/1\/2024/i);
    expect(dateElements.length).toBeGreaterThan(0);

    // Check status
    const statusElements = withinCard.getAllByText(/submitted/i);
    expect(statusElements.length).toBeGreaterThan(0);
  });

  it('calls onClick handler when card is clicked', () => {
    renderComponent();

    // Find and click the card
    const card = screen.getByText(/Ticket #123/i).closest('.card');
    fireEvent.click(card);

    // Verify onClick was called with correct dispute
    expect(mockOnClick).toHaveBeenCalledWith(mockDispute);
  });

  it('applies correct status color for different statuses', () => {
    const testCases = [
      { status: 'submitted', expectedColor: '#32CD32' },
      { status: 'approved', expectedColor: 'var(--bs-success)' },
      { status: 'closed', expectedColor: 'var(--bs-success)' },
      { status: 'rejected', expectedColor: 'var(--bs-danger)' },
      { status: 'pending', expectedColor: 'var(--bs-primary)' }
    ];

    testCases.forEach(({ status, expectedColor }) => {
      const disputeWithStatus = { ...mockDispute, status };
      
      const { unmount } = renderComponent(disputeWithStatus);

      const statusElement = screen.getByText(new RegExp(status, 'i'));
      expect(statusElement).toHaveStyle(`color: ${expectedColor}`);

      unmount();
    });
  });

  it('renders card with correct bootstrap classes', () => {
    renderComponent();

    const card = screen.getByText(/Ticket #123/i).closest('.card');
    
    expect(card).toHaveClass('h-100');
    expect(card).toHaveClass('shadow-sm');
    expect(card).toHaveStyle('cursor: pointer');
  });

  it('calls utility functions with correct arguments', () => {
    renderComponent();

    // Verify formatCurrency was called with correct amount
    expect(formatCurrency).toHaveBeenCalledWith(1000);

    // Verify formatDate was called with correct date
    expect(formatDate).toHaveBeenCalledWith('2024-01-01T12:00:00Z');
  });
});