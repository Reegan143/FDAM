import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DisputeModal from './adminDisputeModal';
import React from 'react';

// Mock data for dispute
const mockDispute = {
  email: 'test@example.com',
  ticketNumber: 'TICKET123',
  transactionId: 'TRANS456',
  amount: 1000,
  createdAt: '2024-02-27T10:00:00Z',
  digitalChannel: 'Online',
  debitCardNumber: '1234-5678-9012-3456',
  cardType: 'Visa',
  vendorName: 'Test Vendor',
  vendorResponse: 'No issues found',
  status: 'Submitted',
  complaintType: 'Fraud',
  description: 'Suspicious transaction detected'
};

describe('DisputeModal Component', () => {
  // Basic Rendering Tests
  it('renders modal when show is true', () => {
    const { getByText } = render(
      <DisputeModal 
        show={true} 
        dispute={mockDispute} 
        onClose={vi.fn()} 
        onUpdateStatus={vi.fn()} 
        onViewTransaction={vi.fn()}
      />
    );

    expect(screen.getByText('Dispute Details')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('does not render when dispute is null', () => {
    const { container } = render(
      <DisputeModal 
        show={true} 
        dispute={null} 
        onClose={vi.fn()} 
        onUpdateStatus={vi.fn()} 
        onViewTransaction={vi.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  // Button Interaction Tests
  it('calls onClose when close button is clicked', () => {
    const mockOnClose = vi.fn();
    render(
      <DisputeModal 
        show={true} 
        dispute={mockDispute} 
        onClose={mockOnClose} 
        onUpdateStatus={vi.fn()} 
        onViewTransaction={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('Close'));
    expect(mockOnClose).toHaveBeenCalledOnce();
  });

  it('calls onViewTransaction when transaction details button is clicked', () => {
    const mockViewTransaction = vi.fn();
    render(
      <DisputeModal 
        show={true} 
        dispute={mockDispute} 
        onClose={vi.fn()} 
        onUpdateStatus={vi.fn()} 
        onViewTransaction={mockViewTransaction}
      />
    );

    fireEvent.click(screen.getByText('Check Transaction Details'));
    expect(mockViewTransaction).toHaveBeenCalledWith(mockDispute.transactionId);
  });

  // Status Update Tests
  it('does not render approve/reject buttons for closed disputes', () => {
    const closedDispute = { ...mockDispute, status: 'Closed' };
    render(
      <DisputeModal 
        show={true} 
        dispute={closedDispute} 
        onClose={vi.fn()} 
        onUpdateStatus={vi.fn()} 
        onViewTransaction={vi.fn()}
      />
    );

    expect(screen.queryByText('Approve')).toBeNull();
    expect(screen.queryByText('Reject')).toBeNull();
  });

  it('renders approve/reject buttons for open disputes', () => {
    render(
      <DisputeModal 
        show={true} 
        dispute={mockDispute} 
        onClose={vi.fn()} 
        onUpdateStatus={vi.fn()} 
        onViewTransaction={vi.fn()}
      />
    );

    expect(screen.getByText('Approve')).toBeInTheDocument();
    expect(screen.getByText('Reject')).toBeInTheDocument();
  });

  it('calls onUpdateStatus with correct status when approve/reject clicked', () => {
    const mockUpdateStatus = vi.fn();
    render(
      <DisputeModal 
        show={true} 
        dispute={mockDispute} 
        onClose={vi.fn()} 
        onUpdateStatus={mockUpdateStatus} 
        onViewTransaction={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('Approve'));
    expect(mockUpdateStatus).toHaveBeenCalledWith('approved');

    fireEvent.click(screen.getByText('Reject'));
    expect(mockUpdateStatus).toHaveBeenCalledWith('rejected');
  });

  // Remarks Input Test
  it('allows remarks input for open disputes', () => {
    const mockSetRemarks = vi.fn();
    render(
      <DisputeModal 
        show={true} 
        dispute={mockDispute} 
        remarks=""
        setRemarks={mockSetRemarks}
        onClose={vi.fn()} 
        onUpdateStatus={vi.fn()} 
        onViewTransaction={vi.fn()}
      />
    );

    const remarksTextarea = screen.getByPlaceholderText('Enter your remarks...');
    fireEvent.change(remarksTextarea, { target: { value: 'Test remarks' } });
    expect(mockSetRemarks).toHaveBeenCalledWith('Test remarks');
  });
});