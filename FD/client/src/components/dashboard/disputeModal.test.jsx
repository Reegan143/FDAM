import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DisputeModal from './disputeModal';
import { formatCurrency } from '../utils/currencyFormatter';
import { formatDate } from '../utils/dateFormates';
import { getStatusStyle } from '../utils/statusStyles';
import { generateUserReport } from '../utils/userReport';

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

vi.mock('../utils/userReport', () => ({
  generateUserReport: vi.fn(),
}));

global.alert = vi.fn();
console.error = vi.fn();

describe('DisputeModal', () => {
  const mockDispute = {
    _id: 'disp123',
    ticketNumber: 'TKT-12345',
    transactionId: 'trans123',
    amount: 100.50,
    createdAt: '2025-01-15T10:30:00Z',
    digitalChannel: 'Online',
    debitCardNumber: '****1234',
    cardType: 'Visa',
    vendorName: 'Example Store',
    status: 'Pending',
    complaintType: 'Unauthorized Charge',
    description: 'I did not make this purchase.',
  };

  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when show is false', () => {
    render(<DisputeModal show={false} dispute={mockDispute} onClose={mockOnClose} />);
    
    expect(screen.queryByText('Dispute Details')).not.toBeInTheDocument();
  });

  it('should render when show is true', () => {
    render(<DisputeModal show={true} dispute={mockDispute} onClose={mockOnClose} />);
    
    expect(screen.getByText('Dispute Details')).toBeInTheDocument();
  });

  it('should display all dispute information correctly', () => {
    render(<DisputeModal show={true} dispute={mockDispute} onClose={mockOnClose} />);
    
    expect(screen.getByText('Transaction Information')).toBeInTheDocument();
    expect(screen.getByText(/Ticket No:/)).toBeInTheDocument();
    expect(screen.getByText('TKT-12345')).toBeInTheDocument();
    expect(screen.getByText(/Transaction ID:/)).toBeInTheDocument();
    expect(screen.getByText('trans123', { exact: false })).toBeInTheDocument();
    
    expect(formatCurrency).toHaveBeenCalledWith(100.50);
    expect(formatDate).toHaveBeenCalledWith('2025-01-15T10:30:00Z');
    
    expect(screen.getByText(/Channel:/)).toBeInTheDocument();
    expect(screen.getByText('Online')).toBeInTheDocument();
    expect(screen.getByText(/Card Number:/)).toBeInTheDocument();
    expect(screen.getByText('****1234')).toBeInTheDocument();
    expect(screen.getByText(/Card Type:/)).toBeInTheDocument();
    expect(screen.getByText('Visa')).toBeInTheDocument();
    expect(screen.getByText(/Complaint On:/)).toBeInTheDocument();
    expect(screen.getByText('EXAMPLE STORE')).toBeInTheDocument();
  });

  it('should display the transaction ID if vendorName is not available', () => {
    const disputeWithoutVendor = {
      ...mockDispute,
      vendorName: null,
    };
    
    render(<DisputeModal show={true} dispute={disputeWithoutVendor} onClose={mockOnClose} />);
    
    expect(screen.getByText(/Complaint On:/)).toBeInTheDocument();
    expect(screen.getByText(`TransactionId : ${mockDispute.transactionId}`)).toBeInTheDocument();
  });

  it('should display dispute status information correctly', () => {
    render(<DisputeModal show={true} dispute={mockDispute} onClose={mockOnClose} />);
    
    expect(screen.getByText('Dispute Status')).toBeInTheDocument();
    expect(screen.getByText(/Current Status:/)).toBeInTheDocument();
    
    expect(getStatusStyle).toHaveBeenCalledWith('Pending');
    const statusElement = screen.getByText('Pending');
    expect(statusElement).toBeInTheDocument();
    expect(statusElement).toHaveStyle({ color: 'rgb(255, 165, 0)' });
    
    expect(screen.getByText(/Complaint Type:/)).toBeInTheDocument();
    expect(screen.getByText('Unauthorized Charge')).toBeInTheDocument();
    expect(screen.getByText(/Description:/)).toBeInTheDocument();
    expect(screen.getByText('I did not make this purchase.')).toBeInTheDocument();
  });

  it('should call onClose when the close button is clicked', () => {
    render(<DisputeModal show={true} dispute={mockDispute} onClose={mockOnClose} />);
    
    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when the X button in the header is clicked', () => {
    render(<DisputeModal show={true} dispute={mockDispute} onClose={mockOnClose} />);
    
    const closeButton = document.querySelector('.btn-close');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call generateUserReport when Download PDF button is clicked', () => {
    render(<DisputeModal show={true} dispute={mockDispute} onClose={mockOnClose} />);
    
    const downloadButton = screen.getByText('Download PDF');
    fireEvent.click(downloadButton);
    
    expect(generateUserReport).toHaveBeenCalledTimes(1);
    expect(generateUserReport).toHaveBeenCalledWith(mockDispute);
  });

  it('should handle PDF generation error correctly', () => {
    generateUserReport.mockImplementationOnce(() => {
      throw new Error('PDF generation failed');
    });
    
    render(<DisputeModal show={true} dispute={mockDispute} onClose={mockOnClose} />);
    
    const downloadButton = screen.getByText('Download PDF');
    fireEvent.click(downloadButton);
    
    expect(console.error).toHaveBeenCalledWith('Error generating PDF:', expect.any(Error));
    expect(alert).toHaveBeenCalledWith('Failed to generate PDF. Please try again.');
  });

  it('should not call generateUserReport if dispute is null', () => {
    render(<DisputeModal show={true} dispute={null} onClose={mockOnClose} />);
    
    const downloadButton = screen.getByText('Download PDF');
    fireEvent.click(downloadButton);
    
    expect(generateUserReport).not.toHaveBeenCalled();
  });

  it('should render empty modal body when dispute is null', () => {
    render(<DisputeModal show={true} dispute={null} onClose={mockOnClose} />);
    
    expect(screen.queryByText('Transaction Information')).not.toBeInTheDocument();
    expect(screen.queryByText('Dispute Status')).not.toBeInTheDocument();
  });

  it('should handle missing dispute properties gracefully', () => {
    const incompleteDispute = {
      _id: 'disp123',
      transactionId: 'trans123',
      status: 'Pending',
    };
    
    render(<DisputeModal show={true} dispute={incompleteDispute} onClose={mockOnClose} />);
    
    expect(screen.getByText('Dispute Details')).toBeInTheDocument();
    expect(screen.getByText(/Transaction ID:/)).toBeInTheDocument();
    
    const transactionIdElements = screen.getAllByText(/trans123/);
    expect(transactionIdElements.length).toBeGreaterThan(0);
    
    expect(formatCurrency).toHaveBeenCalledWith(undefined);
  });
});