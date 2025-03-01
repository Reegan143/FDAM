import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DisputeCard from './disputeCard';
import { formatCurrency } from '../utils/currencyFormatter';
import { formatDate } from '../utils/dateFormates';
import { getStatusStyle } from '../utils/statusStyles';

vi.mock('../utils/currencyFormatter', () => ({
  formatCurrency: vi.fn(amount => {
    if (amount === undefined) return '$0.00';
    return `$${amount.toFixed(2)}`;
  }),
}));

vi.mock('../utils/dateFormates', () => ({
  formatDate: vi.fn(date => '01/15/2025'),
}));

vi.mock('../utils/statusStyles', () => ({
  getStatusStyle: vi.fn(status => {
    const styles = {
      'Pending': { color: 'rgb(255, 165, 0)' },  
      'Resolved': { color: 'rgb(0, 128, 0)' },   
      'Rejected': { color: 'rgb(255, 0, 0)' },
    };
    return styles[status] || {};
  }),
}));

describe('DisputeCard', () => {
  const mockDispute = {
    _id: 'disp123',
    transactionId: 'trans123',
    amount: 100.50,
    complaintType: 'Unauthorized Charge',
    createdAt: '2025-01-15T10:30:00Z',
    status: 'Pending',
  };

  const mockOnClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the dispute card with correct transaction ID', () => {
    render(<DisputeCard dispute={mockDispute} onClick={mockOnClick} />);
    
    expect(screen.getByText('Transaction ID: trans123')).toBeInTheDocument();
  });

  it('displays formatted amount using formatCurrency', () => {
    render(<DisputeCard dispute={mockDispute} onClick={mockOnClick} />);
    
    expect(screen.getByText(/Amount:/)).toBeInTheDocument();
    expect(formatCurrency).toHaveBeenCalledWith(100.50);
    expect(screen.getByText(/\$100.50/)).toBeInTheDocument();
  });

  it('displays complaint type correctly', () => {
    render(<DisputeCard dispute={mockDispute} onClick={mockOnClick} />);
    
    expect(screen.getByText(/Type:/)).toBeInTheDocument();
    expect(screen.getByText(/Unauthorized Charge/)).toBeInTheDocument();
  });

  it('displays formatted date using formatDate', () => {
    render(<DisputeCard dispute={mockDispute} onClick={mockOnClick} />);
    
    expect(screen.getByText(/Date:/)).toBeInTheDocument();
    expect(formatDate).toHaveBeenCalledWith('2025-01-15T10:30:00Z');
    expect(screen.getByText(/01\/15\/2025/)).toBeInTheDocument();
  });

  it('displays status with correct styling', () => {
    render(<DisputeCard dispute={mockDispute} onClick={mockOnClick} />);
    
    expect(screen.getByText(/Status:/)).toBeInTheDocument();
    expect(getStatusStyle).toHaveBeenCalledWith('Pending');
    
    const statusElement = screen.getByText('Pending');
    expect(statusElement).toBeInTheDocument();
    expect(statusElement).toHaveStyle({ color: 'rgb(255, 165, 0)' });
  });

  it('calls onClick handler when card is clicked', () => {
    render(<DisputeCard dispute={mockDispute} onClick={mockOnClick} />);
    
    const card = screen.getByText('Transaction ID: trans123').closest('.card');
    fireEvent.click(card);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('renders with different status styling', () => {
    const resolvedDispute = {
      ...mockDispute,
      status: 'Resolved'
    };
    
    render(<DisputeCard dispute={resolvedDispute} onClick={mockOnClick} />);
    
    expect(getStatusStyle).toHaveBeenCalledWith('Resolved');
    const statusElement = screen.getByText('Resolved');
    expect(statusElement).toHaveStyle({ color: 'rgb(0, 128, 0)' });
  });

  it('handles missing dispute data gracefully', () => {
    const incompleteDispute = {
      _id: 'disp123',
      transactionId: 'trans123',
      status: 'Pending'  
    };
    
    render(<DisputeCard dispute={incompleteDispute} onClick={mockOnClick} />);
    
    expect(screen.getByText('Transaction ID: trans123')).toBeInTheDocument();
    expect(formatCurrency).toHaveBeenCalledWith(undefined);
    expect(screen.getByText(/Amount:/)).toBeInTheDocument();
    expect(screen.getByText(/\$0.00/)).toBeInTheDocument();
  });
});