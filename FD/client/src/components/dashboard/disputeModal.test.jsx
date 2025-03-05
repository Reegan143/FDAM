import React from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DisputeModal from './disputeModal';
import { getStatusStyle } from '../utils/statusStyles';
import { generateUserReport } from '../utils/userReport';

// Mock utilities
vi.mock('../utils/currencyFormatter', () => ({
  formatCurrency: vi.fn(amount => `$${amount.toFixed(2)}`)
}));

vi.mock('../utils/dateFormates', () => ({
  formatDate: vi.fn(date => '01/01/2023')
}));

vi.mock('../utils/statusStyles', () => ({
  getStatusStyle: vi.fn(() => ({ color: 'blue' }))
}));

vi.mock('../utils/userReport', () => ({
  generateUserReport: vi.fn()
}));

// Mock console.error and window.alert
const originalConsoleError = console.error;
const originalAlert = window.alert;

describe('DisputeModal Component', () => {
  const mockDispute = {
    _id: '123',
    ticketNumber: 'TK-12345',
    transactionId: 'TX123456',
    amount: 250.75,
    createdAt: '2023-01-01T00:00:00.000Z',
    digitalChannel: 'Mobile Banking',
    debitCardNumber: '**** **** **** 1234',
    cardType: 'Visa',
    vendorName: 'Sample Vendor',
    status: 'Submitted',
    complaintType: 'Unauthorized Charge',
    description: 'This is a sample dispute description'
  };

  const mockOnClose = vi.fn();

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    console.error = vi.fn();
    window.alert = vi.fn();
  });

  // Restore original console.error and alert after tests
  afterEach(() => {
    console.error = originalConsoleError;
    window.alert = originalAlert;
  });

  it('should not render when show is false', () => {
    render(<DisputeModal show={false} dispute={mockDispute} onClose={mockOnClose} />);
    
    // Modal shouldn't be visible
    expect(screen.queryByText('Dispute Details')).not.toBeInTheDocument();
  });

  it('should render when show is true', () => {
    render(<DisputeModal show={true} dispute={mockDispute} onClose={mockOnClose} />);
    
    // Modal should be visible
    expect(screen.getByText('Dispute Details')).toBeInTheDocument();
  });

  it('should display all dispute information correctly', () => {
    render(<DisputeModal show={true} dispute={mockDispute} onClose={mockOnClose} />);
    
    // Check transaction information
    expect(screen.getByText('Transaction Information')).toBeInTheDocument();
    
    // Use regex to match text with potential whitespace
    expect(screen.getByText(/Ticket No:/)).toBeInTheDocument();
    expect(screen.getByText(/TK-12345/)).toBeInTheDocument();
    
    expect(screen.getByText(/Transaction ID:/)).toBeInTheDocument();
    expect(screen.getByText(/TX123456/)).toBeInTheDocument();
    
    expect(screen.getByText(/Amount Disputed:/)).toBeInTheDocument();
    expect(screen.getByText(/\$250.75/)).toBeInTheDocument();
    
    expect(screen.getByText(/Date:/)).toBeInTheDocument();
    expect(screen.getByText(/01\/01\/2023/)).toBeInTheDocument();
    
    expect(screen.getByText(/Channel:/)).toBeInTheDocument();
    expect(screen.getByText(/Mobile Banking/)).toBeInTheDocument();
    
    expect(screen.getByText(/Card Number:/)).toBeInTheDocument();
    expect(screen.getByText(/\*\*\*\* \*\*\*\* \*\*\*\* 1234/)).toBeInTheDocument();
    
    expect(screen.getByText(/Card Type:/)).toBeInTheDocument();
    expect(screen.getByText(/Visa/)).toBeInTheDocument();
    
    expect(screen.getByText(/Complaint On:/)).toBeInTheDocument();
    expect(screen.getByText(/SAMPLE VENDOR/)).toBeInTheDocument();
    
    // Check dispute status
    expect(screen.getByText('Dispute Status')).toBeInTheDocument();
    expect(screen.getByText(/Current Status:/)).toBeInTheDocument();
    expect(screen.getByText(/Submitted/)).toBeInTheDocument();
    expect(screen.getByText(/Complaint Type:/)).toBeInTheDocument();
    expect(screen.getByText(/Unauthorized Charge/)).toBeInTheDocument();
    expect(screen.getByText(/Description:/)).toBeInTheDocument();
    expect(screen.getByText(/This is a sample dispute description/)).toBeInTheDocument();
  });

  it('should use transaction ID when vendorName is not present', () => {
    const disputeWithoutVendor = {
      ...mockDispute,
      vendorName: null
    };
    
    render(<DisputeModal show={true} dispute={disputeWithoutVendor} onClose={mockOnClose} />);
    
    // Check that it displays transaction ID instead of vendor name (using regex for flexible matching)
    expect(screen.getByText(/Complaint On:/)).toBeInTheDocument();
    expect(screen.getByText(/TransactionId : TX123456/)).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(<DisputeModal show={true} dispute={mockDispute} onClose={mockOnClose} />);
    
    // Find and click the close button in footer
    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);
    
    // Verify onClose was called
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when X button in header is clicked', () => {
    render(<DisputeModal show={true} dispute={mockDispute} onClose={mockOnClose} />);
    
    // Find and click the close button in header
    const closeButton = document.querySelector('.btn-close');
    fireEvent.click(closeButton);
    
    // Verify onClose was called
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call generateUserReport when Download PDF button is clicked', () => {
    render(<DisputeModal show={true} dispute={mockDispute} onClose={mockOnClose} />);
    
    // Find and click the download button
    const downloadButton = screen.getByText(/Download PDF/);
    fireEvent.click(downloadButton);
    
    // Verify generateUserReport was called with the dispute
    expect(generateUserReport).toHaveBeenCalledTimes(1);
    expect(generateUserReport).toHaveBeenCalledWith(mockDispute);
  });

  it('should handle errors when generating PDF', () => {
    // Make generateUserReport throw an error
    generateUserReport.mockImplementation(() => {
      throw new Error('PDF generation failed');
    });
    
    render(<DisputeModal show={true} dispute={mockDispute} onClose={mockOnClose} />);
    
    // Find and click the download button
    const downloadButton = screen.getByText(/Download PDF/);
    fireEvent.click(downloadButton);
    
    // Verify error handling
    expect(window.alert).toHaveBeenCalledWith('Failed to generate PDF. Please try again.');
  });

  it('should not try to generate PDF if dispute is null', () => {
    render(<DisputeModal show={true} dispute={null} onClose={mockOnClose} />);
    
    // The modal body should be empty when dispute is null
    expect(screen.queryByText('Transaction Information')).not.toBeInTheDocument();
    
    // Try to click download button (if it exists)
    const downloadButton = screen.getByText(/Download PDF/);
    fireEvent.click(downloadButton);
    
    // Verify generateUserReport was not called
    expect(generateUserReport).not.toHaveBeenCalled();
  });

  it('should use getStatusStyle for status styling', () => {
    render(<DisputeModal show={true} dispute={mockDispute} onClose={mockOnClose} />);
    
    // Verify getStatusStyle was called with the status
    expect(getStatusStyle).toHaveBeenCalledWith(mockDispute.status);
    
    // Find status element and check its style - use RGB value instead of named color
    const statusElement = screen.getByText('Submitted');
    expect(statusElement).toHaveStyle('color: rgb(0, 0, 255)');
  });

  it('should have responsive size properties', () => {
    render(<DisputeModal show={true} dispute={mockDispute} onClose={mockOnClose} />);
    
    // Check that modal has the right size and fullscreen property
    const modal = document.querySelector('.modal-dialog');
    expect(modal).toHaveClass('modal-lg');
    expect(modal).toHaveClass('modal-fullscreen-sm-down');
  });
});