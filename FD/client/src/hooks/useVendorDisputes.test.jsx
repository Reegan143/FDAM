// useVendorDispute.test.jsx
import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { useVendorDispute } from './useVendorDispute';

// Mock dependencies
vi.mock('../components/utils/axiosInstance', () => ({
  default: {
    vendor: {
      post: vi.fn()
    },
    admin: {
      post: vi.fn()
    }
  }
}));

vi.mock('../components/utils/vendorReport', () => ({
  generateVendorPdf: vi.fn()
}));

// Import mocked modules
import API from '../components/utils/axiosInstance';
import { generateVendorPdf } from '../components/utils/vendorReport';

describe('useVendorDispute Hook', () => {
  const mockDispute = {
    _id: 'dispute123',
    transactionId: 'tx123'
  };
  const mockResponseMessage = 'Test response';
  const mockAddNotification = vi.fn();
  const mockOnClose = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    API.vendor.post.mockResolvedValue({ data: { message: 'Success' } });
    API.admin.post.mockResolvedValue({ data: { message: 'API Key request successful' } });
  });

  test('should handle submit response successfully', async () => {
    const { result } = renderHook(() => 
      useVendorDispute(mockDispute, mockResponseMessage, mockAddNotification, mockOnClose)
    );
    
    await result.current.handleSubmitResponse();
    
    expect(API.vendor.post).toHaveBeenCalledWith('/vendor/disputes/respond', {
      disputeId: 'dispute123',
      vendorResponse: 'Test response'
    });
    expect(mockAddNotification).toHaveBeenCalledWith('Response submitted successfully');
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('should show warning when response message is empty', async () => {
    const { result } = renderHook(() => 
      useVendorDispute(mockDispute, '', mockAddNotification, mockOnClose)
    );
    
    await result.current.handleSubmitResponse();
    
    expect(mockAddNotification).toHaveBeenCalledWith('Please enter a response before submitting', 'warning');
    expect(API.vendor.post).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  test('should handle error when submitting response', async () => {
    API.vendor.post.mockRejectedValueOnce({
      response: { data: { message: 'Server error' } }
    });
    
    const { result } = renderHook(() => 
      useVendorDispute(mockDispute, mockResponseMessage, mockAddNotification, mockOnClose)
    );
    
    await result.current.handleSubmitResponse();
    
    expect(mockAddNotification).toHaveBeenCalledWith('Server error', 'danger');
    expect(mockOnClose).not.toHaveBeenCalled();
  });



  test('should handle download PDF successfully', () => {
    const { result } = renderHook(() => 
      useVendorDispute(mockDispute, mockResponseMessage, mockAddNotification, mockOnClose)
    );
    
    result.current.handleDownloadPDF();
    
    expect(generateVendorPdf).toHaveBeenCalledWith(mockDispute, mockResponseMessage);
    expect(mockAddNotification).toHaveBeenCalledWith('PDF downloaded successfully');
  });

  test('should handle error when downloading PDF', () => {
    generateVendorPdf.mockImplementationOnce(() => {
      throw new Error('PDF generation failed');
    });
    
    const { result } = renderHook(() => 
      useVendorDispute(mockDispute, mockResponseMessage, mockAddNotification, mockOnClose)
    );
    
    result.current.handleDownloadPDF();
    
    expect(mockAddNotification).toHaveBeenCalledWith('Error generating PDF. Please try again.', 'danger');
  });
});