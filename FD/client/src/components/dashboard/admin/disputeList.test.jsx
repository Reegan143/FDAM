import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DisputeList from './disputeList';

// Mock dependencies
vi.mock('../../utils/currencyFormatter', () => ({
  formatCurrency: vi.fn(amount => `$${amount}`)
}));

vi.mock('../../utils/dateFormates', () => ({
  formatDate: vi.fn(date => '2023-01-01')
}));

describe('DisputeList Component', () => {
  const mockDisputes = [
    {
      _id: '1',
      transactionId: 'TX123456',
      amount: 100,
      complaintType: 'Fraud',
      createdAt: '2023-01-01T00:00:00Z',
      status: 'submitted'
    },
    {
      _id: '2',
      transactionId: 'TX789012',
      amount: 200,
      complaintType: 'Wrong Charge',
      createdAt: '2023-01-02T00:00:00Z',
      status: 'closed'
    }
  ];
  
  it('renders the header with correct count', () => {
    const props = {
      disputes: mockDisputes,
      sortBy: 'date_asc',
      setSortBy: vi.fn(),
      searchQuery: '',
      setSearchQuery: vi.fn(),
      onDisputeClick: vi.fn()
    };
    
    render(<DisputeList {...props} />);
    expect(screen.getByText('All Disputes (2)')).toBeInTheDocument();
  });
  
  it('renders search input and handles changes', () => {
    const setSearchQuery = vi.fn();
    const props = {
      disputes: mockDisputes,
      sortBy: 'date_asc',
      setSortBy: vi.fn(),
      searchQuery: '',
      setSearchQuery,
      onDisputeClick: vi.fn()
    };
    
    render(<DisputeList {...props} />);
    
    const searchInput = screen.getByPlaceholderText("Search by user's email");
    expect(searchInput).toBeInTheDocument();
    expect(searchInput.value).toBe('');
    
    fireEvent.change(searchInput, { target: { value: 'test@example.com' } });
    expect(setSearchQuery).toHaveBeenCalledWith('test@example.com');
  });
  
  it('renders sort select and handles changes', () => {
    const setSortBy = vi.fn();
    const props = {
      disputes: mockDisputes,
      sortBy: 'date_asc',
      setSortBy,
      searchQuery: '',
      setSearchQuery: vi.fn(),
      onDisputeClick: vi.fn()
    };
    
    // Render the component with the fresh mock
    render(<DisputeList {...props} />);
    
    // Find the select element (Form.Select creates a <select> element)
    const selectElement = screen.getByRole('combobox');
    expect(selectElement).toBeInTheDocument();
    
    // Simulate change event
    fireEvent.change(selectElement, { target: { value: 'amount_desc' } });
    
    // Check if the setSortBy function was called with the correct value
    expect(setSortBy).toHaveBeenCalledWith('amount_desc');
  });
  
  it('renders dispute cards for each dispute', () => {
    const props = {
      disputes: mockDisputes,
      sortBy: 'date_asc',
      setSortBy: vi.fn(),
      searchQuery: '',
      setSearchQuery: vi.fn(),
      onDisputeClick: vi.fn()
    };
    
    render(<DisputeList {...props} />);
    
    expect(screen.getByText('Transaction ID: TX123456')).toBeInTheDocument();
    expect(screen.getByText('Transaction ID: TX789012')).toBeInTheDocument();
    expect(screen.getAllByText('Amount:').length).toBe(2);
    expect(screen.getAllByText('Type:').length).toBe(2);
  });
  
  it('renders correct status styles', () => {
    const props = {
      disputes: mockDisputes,
      sortBy: 'date_asc',
      setSortBy: vi.fn(),
      searchQuery: '',
      setSearchQuery: vi.fn(),
      onDisputeClick: vi.fn()
    };
    
    render(<DisputeList {...props} />);
    
    const submittedStatus = screen.getByText('submitted');
    const closedStatus = screen.getByText('closed');
    
    expect(submittedStatus.style.color).toBe('green');
    expect(closedStatus.style.color).toBe('red');
  });
  
  it('calls onDisputeClick when a dispute card is clicked', () => {
    const onDisputeClick = vi.fn();
    const props = {
      disputes: mockDisputes,
      sortBy: 'date_asc',
      setSortBy: vi.fn(),
      searchQuery: '',
      setSearchQuery: vi.fn(),
      onDisputeClick
    };
    
    const { container } = render(<DisputeList {...props} />);
    
    // Use container.querySelector to find the card
    const firstDisputeCard = container.querySelector('.card');
    expect(firstDisputeCard).not.toBeNull();
    
    fireEvent.click(firstDisputeCard);
    
    expect(onDisputeClick).toHaveBeenCalledWith(mockDisputes[0]);
  });
  
  it('shows "no disputes" message when disputes array is empty', () => {
    const props = {
      disputes: [],
      sortBy: 'date_asc',
      setSortBy: vi.fn(),
      searchQuery: '',
      setSearchQuery: vi.fn(),
      onDisputeClick: vi.fn()
    };
    
    render(<DisputeList {...props} />);
    
    expect(screen.getByText('No disputes found matching your search criteria.')).toBeInTheDocument();
  });
});