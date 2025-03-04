import { vi, describe, test, expect, beforeEach } from 'vitest';

// Mock modules - these need to be before imports and don't depend on variables
vi.mock('jspdf', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      setFontSize: vi.fn(),
      setTextColor: vi.fn(),
      text: vi.fn(),
      setDrawColor: vi.fn(),
      setLineWidth: vi.fn(),
      line: vi.fn(),
      setFont: vi.fn(),
      autoTable: vi.fn(),
      internal: {
        getNumberOfPages: vi.fn().mockReturnValue(1),
        pageSize: {
          getWidth: vi.fn().mockReturnValue(210),
          getHeight: vi.fn().mockReturnValue(297),
          width: 210,
          height: 297
        }
      },
      lastAutoTable: { finalY: 100 },
      save: vi.fn(),
      rect: vi.fn(),
      setFillColor: vi.fn(),
      setPage: vi.fn(),
      splitTextToSize: vi.fn().mockImplementation((text) => [text])
    }))
  };
});

vi.mock('jspdf-autotable', () => ({}));

vi.mock('axios', () => {
  return {
    default: {
      create: vi.fn().mockReturnValue({
        interceptors: {
          request: {
            use: vi.fn()
          }
        }
      })
    }
  };
});

// Import files to test after mocking
import { formatCurrency } from './currencyFormatter';
import { formatDate, formatDateForFilename } from './dateFormates';
import { generateUserReport } from './userReport';
import { generateVendorPdf } from './vendorReport';
import { generateAdminDisputePDF } from './generateAdminPdf';
import { sortDisputes, filterDisputesByName } from './sortDisputes';
import { getStatusStyle, ModalAnimationStyles } from './statusStyles';
import API, { setAuthToken, userAPI, adminAPI, vendorAPI, utilsAPI } from './axiosInstance';
import jsPDF from 'jspdf';

// Sample data for testing
const mockDispute = {
  ticketNumber: 'TKT12345',
  transactionId: 'TRANS67890',
  amount: 100.50,
  createdAt: '2023-01-01T12:00:00Z',
  digitalChannel: 'Mobile',
  debitCardNumber: '1234XXXXXXXX5678',
  cardType: 'Visa',
  vendorName: 'TestVendor',
  status: 'submitted',
  complaintType: 'Payment Issue',
  description: 'Test description',
  email: 'test@example.com',
  adminRemarks: 'Test remarks',
  vendorResponse: 'Test response'
};

describe('Currency Formatter', () => {
  test('formats currency correctly', () => {
    expect(formatCurrency(100)).toBe('$100.00');
    expect(formatCurrency(100.5)).toBe('$100.50');
    expect(formatCurrency(null)).toBe('N/A');
    expect(formatCurrency('not a number')).toBe('N/A');
  });
});

describe('Date Formatters', () => {
  test('formatDate formats date correctly', () => {
    const date = new Date('2023-01-01T12:00:00Z');
    expect(formatDate('2023-01-01T12:00:00Z')).toContain('January');
    expect(formatDate('2023-01-01T12:00:00Z')).toContain('2023');
  });

  test('formatDateForFilename formats date for filename', () => {
    const date = new Date('2023-01-01T12:00:00Z');
    expect(formatDateForFilename(date)).toBe('2023-01-01');
  });
});

describe('PDF Generation', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
  });

  test('generateUserReport creates PDF correctly', () => {
    generateUserReport(mockDispute);
    // Access the mocked save function
    expect(vi.mocked(jsPDF).mock.results[0].value.save).toHaveBeenCalledWith(`Dispute_${mockDispute.ticketNumber}.pdf`);
  });

  test('generateVendorPdf creates PDF correctly', async () => {
    await generateVendorPdf(mockDispute, 'Test response message');
    expect(vi.mocked(jsPDF).mock.results[0].value.save).toHaveBeenCalledWith(`Dispute_${mockDispute.transactionId}.pdf`);
  });

  test('generateAdminDisputePDF creates PDF correctly', () => {
    generateAdminDisputePDF(mockDispute, 'Test remarks');
    expect(vi.mocked(jsPDF).mock.results[0].value.save).toHaveBeenCalled();
  });

  test('generateAdminDisputePDF returns early if no dispute provided', () => {
    vi.clearAllMocks();
    const result = generateAdminDisputePDF(null);
    expect(jsPDF).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
  });
});

describe('Dispute Sorting and Filtering', () => {
  const mockDisputes = [
    { ...mockDispute, createdAt: '2023-01-01T12:00:00Z', amount: 100, status: 'submitted', email: 'alice@example.com' },
    { ...mockDispute, createdAt: '2023-02-01T12:00:00Z', amount: 200, status: 'approved', email: 'bob@example.com' }
  ];

  test('sortDisputes sorts by date ascending', () => {
    const result = sortDisputes(mockDisputes, 'date_asc');
    expect(result[0].createdAt).toBe('2023-01-01T12:00:00Z');
    expect(result[1].createdAt).toBe('2023-02-01T12:00:00Z');
  });

  test('sortDisputes sorts by amount descending', () => {
    const result = sortDisputes(mockDisputes, 'amount_desc');
    expect(result[0].amount).toBe(200);
    expect(result[1].amount).toBe(100);
  });

  test('sortDisputes sorts by amount ascending', () => {
    const result = sortDisputes(mockDisputes, 'amount_asc');
    expect(result[0].amount).toBe(100);
    expect(result[1].amount).toBe(200);
  });

  test('sortDisputes sorts by unsolved first', () => {
    const result = sortDisputes(mockDisputes, 'unsolved_first');
    expect(result[0].status).toBe('submitted');
    expect(result[1].status).toBe('approved');
  });

  test('sortDisputes returns original array for unknown sort type', () => {
    const result = sortDisputes(mockDisputes, 'unknown');
    expect(result).toEqual(mockDisputes);
  });

  test('sortDisputes handles null input', () => {
    const result = sortDisputes(null, 'date_asc');
    expect(result).toEqual([]);
  });

  test('filterDisputesByName filters correctly', () => {
    const result = filterDisputesByName(mockDisputes, 'alice');
    expect(result.length).toBe(1);
    expect(result[0].email).toBe('alice@example.com');
  });

  test('filterDisputesByName returns all disputes if no search query', () => {
    const result = filterDisputesByName(mockDisputes, '');
    expect(result).toEqual(mockDisputes);
  });
});

describe('Status Styles', () => {
  test('getStatusStyle returns correct style for approved status', () => {
    const style = getStatusStyle('approved');
    expect(style.color).toBe('var(--bs-success)');
  });

  test('getStatusStyle returns correct style for closed status', () => {
    const style = getStatusStyle('closed');
    expect(style.color).toBe('var(--bs-success)');
  });

  test('getStatusStyle returns correct style for rejected status', () => {
    const style = getStatusStyle('rejected');
    expect(style.color).toBe('var(--bs-danger)');
  });

  test('getStatusStyle returns correct style for submitted status', () => {
    const style = getStatusStyle('submitted');
    expect(style.color).toBe('#32CD32');
  });

  test('getStatusStyle returns default style for unknown status', () => {
    const style = getStatusStyle('unknown');
    expect(style.color).toBe('var(--bs-primary)');
  });

  test('getStatusStyle handles empty status', () => {
    const style = getStatusStyle();
    expect(style.color).toBe('var(--bs-primary)');
  });

  test('ModalAnimationStyles returns a style component', () => {
    const styleComponent = ModalAnimationStyles();
    expect(styleComponent.type).toBe('style');
    expect(styleComponent.props.children).toContain('.modal.fade');
  });
});

describe('Axios Instance', () => {
  test('createAPIInstance creates instances with correct structure', () => {
    expect(userAPI.interceptors).toBeDefined();
    expect(adminAPI.interceptors).toBeDefined();
    expect(vendorAPI.interceptors).toBeDefined();
    expect(utilsAPI.interceptors).toBeDefined();
  });

  test('setAuthToken adds auth token to request headers', () => {
    const getToken = () => 'test-token';
    setAuthToken(getToken);
    
    // Each instance should have interceptors.request.use called
    expect(userAPI.interceptors.request.use).toHaveBeenCalled();
  });

  test('API object exports all instances', () => {
    expect(API.user).toBe(userAPI);
    expect(API.admin).toBe(adminAPI);
    expect(API.vendor).toBe(vendorAPI);
    expect(API.utils).toBe(utilsAPI);
  });
});