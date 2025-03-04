import React from 'react';
import { vi, describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DisputeCard from './disputeCard';

// Mock utilities
vi.mock('../utils/currencyFormatter', () => ({
  formatCurrency: vi.fn(amount => `$${amount.toFixed(2)}`)
}));

vi.mock('../utils/dateFormates', () => ({
  formatDate: vi.fn(date => '01/01/2023')
}));

vi.mock('../utils/statusStyles', () => ({
  getStatusStyle: vi.fn()
}));

describe('DisputeCard Component', () => {
  const mockDispute = {
    _id: '123',
    transactionId: 'TX123456',
    amount: 250.75,
    complaintType: 'Unauthorized Charge',
    createdAt: '2023-01-01T00:00:00.000Z',
    status: 'Submitted'
  };

  const mockOnClick = vi.fn();

  it('should render the dispute card with correct information', () => {
    render(<DisputeCard dispute={mockDispute} onClick={mockOnClick} />);

    // Check transaction ID
    expect(screen.getByText(`Transaction ID: ${mockDispute.transactionId}`)).toBeInTheDocument();
    
    // Check amount
    expect(screen.getByText('Amount:')).toBeInTheDocument();
    expect(screen.getByText('$250.75')).toBeInTheDocument();
    
    // Check complaint type
    expect(screen.getByText('Type:')).toBeInTheDocument();
    expect(screen.getByText(mockDispute.complaintType)).toBeInTheDocument();
    
    // Check date
    expect(screen.getByText('Date:')).toBeInTheDocument();
    expect(screen.getByText('01/01/2023')).toBeInTheDocument();
    
    // Check status
    expect(screen.getByText('Status:')).toBeInTheDocument();
    expect(screen.getByText(mockDispute.status)).toBeInTheDocument();
  });

  it('should call onClick when the card is clicked', () => {
    render(<DisputeCard dispute={mockDispute} onClick={mockOnClick} />);
    
    // Get the card element
    const card = screen.getByText(`Transaction ID: ${mockDispute.transactionId}`).closest('.card');
    
    // Click the card
    fireEvent.click(card);
    
    // Verify onClick was called
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('should render with green color for "submitted" status', () => {
    const submittedDispute = {
      ...mockDispute,
      status: 'Submitted'
    };
    
    render(<DisputeCard dispute={submittedDispute} onClick={mockOnClick} />);
    
    // Find the status element
    const statusElement = screen.getByText('Submitted');
    
    // Check that it has green color (using RGB value)
    expect(statusElement).toHaveStyle('color: rgb(0, 128, 0)');
  });

  it('should render with red color for "closed" status', () => {
    const closedDispute = {
      ...mockDispute,
      status: 'Closed'
    };
    
    render(<DisputeCard dispute={closedDispute} onClick={mockOnClick} />);
    
    // Find the status element
    const statusElement = screen.getByText('Closed');
    
    // Check that it has red color (using RGB value)
    expect(statusElement).toHaveStyle('color: rgb(255, 0, 0)');
  });

  it('should render with warning color for other status types', () => {
    const pendingDispute = {
      ...mockDispute,
      status: 'Pending'
    };
    
    render(<DisputeCard dispute={pendingDispute} onClick={mockOnClick} />);
    
    // Find the status element
    const statusElement = screen.getByText('Pending');
    
    // Check that it has the warning color variable
    expect(statusElement).toHaveStyle('color: var(--bs-warning)');
  });

  it('should handle case insensitivity for status styles', () => {
    const mixedCaseDispute = {
      ...mockDispute,
      status: 'SuBmItTeD'
    };
    
    render(<DisputeCard dispute={mixedCaseDispute} onClick={mockOnClick} />);
    
    // Find the status element
    const statusElement = screen.getByText('SuBmItTeD');
    
    // Check that it still has green color despite different casing (using RGB value)
    expect(statusElement).toHaveStyle('color: rgb(0, 128, 0)');
  });

  it('should have a pointer cursor style', () => {
    render(<DisputeCard dispute={mockDispute} onClick={mockOnClick} />);
    
    // Get the card element
    const card = screen.getByText(`Transaction ID: ${mockDispute.transactionId}`).closest('.card');
    
    // Check cursor style
    expect(card).toHaveStyle('cursor: pointer');
  });

  it('should have shadow-sm and border-0 classes', () => {
    render(<DisputeCard dispute={mockDispute} onClick={mockOnClick} />);
    
    // Get the card element
    const card = screen.getByText(`Transaction ID: ${mockDispute.transactionId}`).closest('.card');
    
    // Check classes
    expect(card).toHaveClass('shadow-sm');
    expect(card).toHaveClass('border-0');
    expect(card).toHaveClass('h-100');
  });
});