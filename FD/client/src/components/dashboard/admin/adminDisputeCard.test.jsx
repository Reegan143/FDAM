// Fix for adminDisputeCard.test.jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DisputeCard from './adminDisputeCard';

// Mock dependencies
vi.mock('../../utils/currencyFormatter', () => ({
  formatCurrency: vi.fn(amount => `$${amount}`)
}));

vi.mock('../../utils/dateFormates', () => ({
  formatDate: vi.fn(date => '2023-01-01')
}));

vi.mock('./disputeStatus', () => ({
  getDisputeStatusColor: vi.fn(status => 'success')
}));

describe('DisputeCard Component', () => {
  const mockDispute = {
    transactionId: 'TX123456',
    amount: 100,
    complaintType: 'Fraud',
    type: 'Dispute',
    createdAt: '2023-01-01T00:00:00Z',
    date: '2023-01-01',
    status: 'submitted'
  };
  
  const mockOnClick = vi.fn();
  
  it('renders transaction ID correctly', () => {
    render(<DisputeCard dispute={mockDispute} onClick={mockOnClick} />);
    expect(screen.getByText('Transaction ID:')).toBeInTheDocument();
    expect(screen.getByText('TX123456')).toBeInTheDocument();
  });
  
  it('renders amount with currency format', () => {
    render(<DisputeCard dispute={mockDispute} onClick={mockOnClick} />);
    expect(screen.getByText('Amount:')).toBeInTheDocument();
    expect(screen.getByText('$100')).toBeInTheDocument();
  });
  
  it('renders complaint type correctly', () => {
    render(<DisputeCard dispute={mockDispute} onClick={mockOnClick} />);
    expect(screen.getByText('Type:')).toBeInTheDocument();
    expect(screen.getByText('Fraud')).toBeInTheDocument();
  });
  
  it('uses type if complaintType is not available', () => {
    const disputeWithoutComplaintType = {
      ...mockDispute,
      complaintType: null
    };
    
    render(<DisputeCard dispute={disputeWithoutComplaintType} onClick={mockOnClick} />);
    expect(screen.getByText('Dispute')).toBeInTheDocument();
  });
  
  it('renders date correctly', () => {
    render(<DisputeCard dispute={mockDispute} onClick={mockOnClick} />);
    expect(screen.getByText('Date:')).toBeInTheDocument();
    expect(screen.getByText('2023-01-01')).toBeInTheDocument();
  });
  
  it('renders status with correct style for submitted', () => {
    render(<DisputeCard dispute={mockDispute} onClick={mockOnClick} />);
    expect(screen.getByText('Status:')).toBeInTheDocument();
    
    const statusElement = screen.getByText('submitted');
    expect(statusElement).toBeInTheDocument();
    expect(statusElement).toHaveClass('text-success');
  });
  
  it('renders status with correct style for closed', () => {
    const closedDispute = {
      ...mockDispute,
      status: 'closed'
    };
    
    render(<DisputeCard dispute={closedDispute} onClick={mockOnClick} />);
    
    const statusElement = screen.getByText('closed');
    expect(statusElement).toBeInTheDocument();
    expect(statusElement).toHaveClass('text-danger');
  });
  
  it('renders status with correct style for other statuses', () => {
    const pendingDispute = {
      ...mockDispute,
      status: 'pending'
    };
    
    render(<DisputeCard dispute={pendingDispute} onClick={mockOnClick} />);
    
    const statusElement = screen.getByText('pending');
    expect(statusElement).toBeInTheDocument();
    expect(statusElement).toHaveClass('text-warning');
  });
  
  it('triggers onClick when card is clicked', () => {
    // Correct method: use container to query by CSS class
    const { container } = render(<DisputeCard dispute={mockDispute} onClick={mockOnClick} />);
    
    // Get card by querySelector
    const card = container.querySelector('.card');
    expect(card).not.toBeNull();
    
    // Click the card
    fireEvent.click(card);
    
    // Verify the click handler was called
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
});