import { describe, it, vi, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TransactionView from './transactionView';
import { formatCurrency } from '../utils/currencyFormatter';
import { formatDate } from '../utils/dateFormates';
import { Card, Button } from 'react-bootstrap';

const mockTransactionData = {
  transactionId: '12345',
  amount: 250.75,
  transactionDate: '2023-05-10T12:34:56Z',
  status: 'pending',
  senderName: 'John Doe',
  senderAccNo: '1234567890',
  receiverName: 'Jane Smith',
  receiverAccNo: '0987654321',
  debitCardNumber: '4111111111111111'
};

const getStatusColor = (status) => {
  return status === 'pending' ? 'warning' : 'success';
};

describe('TransactionView Component', () => {
  it('renders without crashing', () => {
    render(<TransactionView transactionData={mockTransactionData} onBack={vi.fn()} getStatusColor={getStatusColor} />);
    expect(screen.getByText('Transaction Details')).toBeInTheDocument();
  });

  it('displays transaction information correctly', () => {
    render(<TransactionView transactionData={mockTransactionData} onBack={vi.fn()} getStatusColor={getStatusColor} />);
    expect(screen.getByText(/Transaction ID:/)).toBeInTheDocument();
    expect(screen.getByText(mockTransactionData.transactionId)).toBeInTheDocument();
    expect(screen.getByText(formatCurrency(mockTransactionData.amount))).toBeInTheDocument();
    expect(screen.getByText(formatDate(mockTransactionData.transactionDate))).toBeInTheDocument();
    expect(screen.getByText(/PENDING/)).toBeInTheDocument();
  });

  it('displays account details correctly', () => {
    render(<TransactionView transactionData={mockTransactionData} onBack={vi.fn()} getStatusColor={getStatusColor} />);
    expect(screen.getByText(mockTransactionData.senderName)).toBeInTheDocument();
    expect(screen.getByText(mockTransactionData.senderAccNo)).toBeInTheDocument();
    expect(screen.getByText(mockTransactionData.receiverName)).toBeInTheDocument();
    expect(screen.getByText(mockTransactionData.receiverAccNo)).toBeInTheDocument();
    expect(screen.getByText(mockTransactionData.debitCardNumber)).toBeInTheDocument();
  });

  

  it('renders loading state when no transaction data is provided', () => {
    render(<TransactionView transactionData={null} onBack={vi.fn()} getStatusColor={getStatusColor} />);
    expect(screen.getByText(/loading transaction details/i)).toBeInTheDocument();
  });
});
