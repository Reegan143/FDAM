import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DisputeModal from './adminDisputeModal';

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

vi.mock('../../utils/generateAdminPdf', () => ({
  generateAdminDisputePDF: vi.fn()
}));

// Import the actual mocked function for testing
import { generateAdminDisputePDF } from '../../utils/generateAdminPdf';

describe('DisputeModal Component', () => {
  const mockDispute = {
    _id: '123',
    ticketNumber: 'TICK123',
    transactionId: 'TX123456',
    amount: 100,
    createdAt: '2023-01-01T00:00:00Z',
    digitalChannel: 'Web',
    debitCardNumber: '1234 **** **** 5678',
    cardType: 'Debit',
    vendorName: 'Test Vendor',
    vendorResponse: 'In progress',
    status: 'submitted',
    complaintType: 'Fraud',
    description: 'Test description',
    email: 'user@example.com'
  };
  
  const mockProps = {
    show: true,
    dispute: mockDispute,
    remarks: 'Test remarks',
    setRemarks: vi.fn(),
    onClose: vi.fn(),
    onUpdateStatus: vi.fn(),
    onViewTransaction: vi.fn(),
    modalAnimation: 'slide-up'
  };
  
  it('renders nothing when dispute is null', () => {
    const { container } = render(<DisputeModal {...mockProps} dispute={null} />);
    expect(container).toBeEmptyDOMElement();
  });
  
  it('renders modal with correct title when show is true', () => {
    render(<DisputeModal {...mockProps} />);
    expect(screen.getByText('Dispute Details')).toBeInTheDocument();
  });
  
  it('displays user information correctly', () => {
    render(<DisputeModal {...mockProps} />);
    expect(screen.getByText('User Information')).toBeInTheDocument();
    expect(screen.getByText('Email:')).toBeInTheDocument();
    expect(screen.getByText('user@example.com')).toBeInTheDocument();
  });
  
  it('displays transaction information correctly', () => {
    render(<DisputeModal {...mockProps} />);
    expect(screen.getByText('Transaction Information')).toBeInTheDocument();
    expect(screen.getByText('Ticket No:')).toBeInTheDocument();
    expect(screen.getByText('TICK123')).toBeInTheDocument();
    expect(screen.getByText('Transaction ID:')).toBeInTheDocument();
    expect(screen.getByText('TX123456')).toBeInTheDocument();
    expect(screen.getByText('Amount Disputed:')).toBeInTheDocument();
    expect(screen.getByText('$100')).toBeInTheDocument();
  });
  
  it('displays vendorName in uppercase if available', () => {
    render(<DisputeModal {...mockProps} />);
    expect(screen.getByText('Complaint On:')).toBeInTheDocument();
    expect(screen.getByText('TEST VENDOR')).toBeInTheDocument();
  });
  
  it('uses transaction ID if vendorName is not available', () => {
    const disputeWithoutVendor = {
      ...mockDispute,
      vendorName: null
    };
    
    render(<DisputeModal {...mockProps} dispute={disputeWithoutVendor} />);
    expect(screen.getByText('Complaint On:')).toBeInTheDocument();
    expect(screen.getByText(`TransactionId : ${disputeWithoutVendor.transactionId}`)).toBeInTheDocument();
  });
  
  it('shows vendor response if available', () => {
    render(<DisputeModal {...mockProps} />);
    expect(screen.getByText('Vendor Response:')).toBeInTheDocument();
    expect(screen.getByText('In progress')).toBeInTheDocument();
  });
  
  it('shows "No response yet" if vendor response is not available', () => {
    const disputeWithoutResponse = {
      ...mockDispute,
      vendorResponse: null
    };
    
    render(<DisputeModal {...mockProps} dispute={disputeWithoutResponse} />);
    expect(screen.getByText('No response yet')).toBeInTheDocument();
  });
  
  it('calls onViewTransaction when "Check Transaction Details" button is clicked', () => {
    render(<DisputeModal {...mockProps} />);
    
    const viewButton = screen.getByText('Check Transaction Details');
    fireEvent.click(viewButton);
    
    expect(mockProps.onViewTransaction).toHaveBeenCalledWith('TX123456');
  });
  
  it('displays dispute status information correctly', () => {
    render(<DisputeModal {...mockProps} />);
    expect(screen.getByText('Dispute Status')).toBeInTheDocument();
    expect(screen.getByText('Current Status:')).toBeInTheDocument();
    expect(screen.getByText('submitted')).toBeInTheDocument();
    expect(screen.getByText('Complaint Type:')).toBeInTheDocument();
    expect(screen.getByText('Fraud')).toBeInTheDocument();
    expect(screen.getByText('Description:')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });
  
  it('shows remarks textarea and handles changes', () => {
    render(<DisputeModal {...mockProps} />);
    
    const textarea = screen.getByPlaceholderText('Enter your remarks...');
    expect(textarea).toBeInTheDocument();
    expect(textarea.value).toBe('Test remarks');
    
    fireEvent.change(textarea, { target: { value: 'New remarks' } });
    expect(mockProps.setRemarks).toHaveBeenCalledWith('New remarks');
  });
  
  it('disables remarks textarea if dispute is closed', () => {
    const closedDispute = {
      ...mockDispute,
      status: 'closed'
    };
    
    render(<DisputeModal {...mockProps} dispute={closedDispute} />);
    
    const textarea = screen.getByPlaceholderText('Enter your remarks...');
    expect(textarea).toBeDisabled();
  });
  
  it('calls generateAdminDisputePDF when "Download PDF" button is clicked', () => {
    render(<DisputeModal {...mockProps} />);
    
    const downloadButton = screen.getByText('Download PDF');
    fireEvent.click(downloadButton);
    
    expect(generateAdminDisputePDF).toHaveBeenCalledWith(mockDispute, 'Test remarks');
  });
  
  it('shows approval buttons if dispute is not closed', () => {
    render(<DisputeModal {...mockProps} />);
    
    expect(screen.getByText('Approve')).toBeInTheDocument();
    expect(screen.getByText('Reject')).toBeInTheDocument();
  });
  
  it('hides approval buttons if dispute is closed', () => {
    const closedDispute = {
      ...mockDispute,
      status: 'closed'
    };
    
    render(<DisputeModal {...mockProps} dispute={closedDispute} />);
    
    expect(screen.queryByText('Approve')).not.toBeInTheDocument();
    expect(screen.queryByText('Reject')).not.toBeInTheDocument();
  });
  
  it('calls onUpdateStatus with "approved" when Approve button is clicked', () => {
    render(<DisputeModal {...mockProps} />);
    
    const approveButton = screen.getByText('Approve');
    fireEvent.click(approveButton);
    
    expect(mockProps.onUpdateStatus).toHaveBeenCalledWith('approved');
  });
  
  it('calls onUpdateStatus with "rejected" when Reject button is clicked', () => {
    render(<DisputeModal {...mockProps} />);
    
    const rejectButton = screen.getByText('Reject');
    fireEvent.click(rejectButton);
    
    expect(mockProps.onUpdateStatus).toHaveBeenCalledWith('rejected');
  });
});