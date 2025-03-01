import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ApiKeys from './vendorApiKeys';
import API from '../utils/axiosInstance';
import { AuthContext } from '../context/authContext';

vi.mock('../dashboard/header/header', () => ({
  default: () => <div data-testid="header">Header Component</div>,
}));

vi.mock('../dashboard/sideBar/vendorSidebar', () => ({
  default: () => <div data-testid="vendor-sidebar">Vendor Sidebar Component</div>,
}));

vi.mock('../utils/axiosInstance', () => ({
  default: {
    vendor: {
      get: vi.fn(),
      post: vi.fn(),
    },
  },
}));

describe('ApiKeys Component', () => {
  const mockToken = 'test-token';
  const mockApiKeys = [
    { apiKey: 'key1', transactionId: 'trans1' },
    { apiKey: 'key2', transactionId: 'trans2' },
  ];
  
  const mockDecodedApiKey = {
    decodedApiKey: {
      isTransaction: {
        id: '12345',
        amount: '100.00',
        currency: 'USD',
        status: 'approved',
      },
    },
  };

  beforeEach(() => {
    global.window.open = vi.fn().mockReturnValue({
      document: {
        write: vi.fn(),
        close: vi.fn(),
      }
    });
    
    vi.clearAllMocks();
    
    API.vendor.get.mockResolvedValue({
      data: { apiKey: mockApiKeys },
    });
    
    vi.spyOn(global, 'setTimeout');
    vi.spyOn(global, 'clearTimeout');
    vi.spyOn(global, 'setInterval');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the component with header and sidebar', async () => {
    await act(async () => {
      render(
        <AuthContext.Provider value={{ token: mockToken }}>
          <ApiKeys />
        </AuthContext.Provider>
      );
    });

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('vendor-sidebar')).toBeInTheDocument();
    expect(screen.getByText('Requested Transaction')).toBeInTheDocument();
    expect(screen.getByText('View and decode your approved API Keys.')).toBeInTheDocument();
  });

  it('displays loading state initially', async () => {
    let { container } = render(
      <AuthContext.Provider value={{ token: mockToken }}>
        <ApiKeys />
      </AuthContext.Provider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('fetches and displays API keys', async () => {
    await act(async () => {
      render(
        <AuthContext.Provider value={{ token: mockToken }}>
          <ApiKeys />
        </AuthContext.Provider>
      );
    });

    expect(API.vendor.get).toHaveBeenCalledWith('/vendor/get-api-key', {
      headers: { Authorization: `Bearer ${mockToken}` },
    });

    expect(screen.getByText('Your API Keys:')).toBeInTheDocument();
    expect(screen.getByText('Transaction ID: trans1')).toBeInTheDocument();
    expect(screen.getByText('Transaction ID: trans2')).toBeInTheDocument();
  });

  it('displays appropriate message when no API keys are found', async () => {
    API.vendor.get.mockResolvedValueOnce({
      data: { apiKey: [] },
    });

    await act(async () => {
      render(
        <AuthContext.Provider value={{ token: mockToken }}>
          <ApiKeys />
        </AuthContext.Provider>
      );
    });

    expect(screen.getByText('No API Keys Found')).toBeInTheDocument();
    expect(screen.getByText('Request API keys from the disputes section.')).toBeInTheDocument();
  });

  it('handles API error when fetching keys', async () => {
    const errorMessage = 'Failed to fetch API keys';
    API.vendor.get.mockRejectedValueOnce({
      response: { data: { error: errorMessage } },
    });

    await act(async () => {
      render(
        <AuthContext.Provider value={{ token: mockToken }}>
          <ApiKeys />
        </AuthContext.Provider>
      );
    });

    expect(screen.getByText('Notification')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    
    expect(screen.getByText('No API Keys Found')).toBeInTheDocument();
  });

  it('decodes API key when clicked', async () => {
    API.vendor.post.mockResolvedValueOnce({
      data: mockDecodedApiKey,
    });

    await act(async () => {
      render(
        <AuthContext.Provider value={{ token: mockToken }}>
          <ApiKeys />
        </AuthContext.Provider>
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Transaction ID: trans1'));
    });

    expect(API.vendor.post).toHaveBeenCalledWith(
      '/vendor/decode-apikey',
      { apiKey: 'key1' },
      { headers: { Authorization: `Bearer ${mockToken}` } }
    );

    expect(window.open).toHaveBeenCalledWith('', '_blank');
    
    const mockWindow = window.open.mock.results[0].value;
    
    expect(mockWindow.document.write).toHaveBeenCalled();
    expect(mockWindow.document.close).toHaveBeenCalled();
    
    const documentContent = mockWindow.document.write.mock.calls[0][0];
    expect(documentContent).toContain('Decoded API Key Data');
  });

  it('handles errors when decoding API key', async () => {
    const decodeErrorMessage = 'Invalid API key format';
    API.vendor.post.mockRejectedValueOnce({
      response: { data: { error: decodeErrorMessage } },
    });

    await act(async () => {
      render(
        <AuthContext.Provider value={{ token: mockToken }}>
          <ApiKeys />
        </AuthContext.Provider>
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Transaction ID: trans1'));
    });

    expect(screen.getByText(decodeErrorMessage)).toBeInTheDocument();
  });

  it('handles decode response with missing decodedApiKey', async () => {
    API.vendor.post.mockResolvedValueOnce({
      data: { /* no decodedApiKey */ },
    });

    await act(async () => {
      render(
        <AuthContext.Provider value={{ token: mockToken }}>
          <ApiKeys />
        </AuthContext.Provider>
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Transaction ID: trans1'));
    });

    expect(screen.getByText('Error decoding API Key')).toBeInTheDocument();
  });
  
  it('clears notifications after timeout', async () => {
    const errorMessage = 'Test error';
    API.vendor.get.mockRejectedValueOnce({
      response: { data: { error: errorMessage } },
    });

    vi.useFakeTimers();
    
    await act(async () => {
      render(
        <AuthContext.Provider value={{ token: mockToken }}>
          <ApiKeys />
        </AuthContext.Provider>
      );
    });

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    
    await act(async () => {
      vi.advanceTimersByTime(3500);
    });
    
    expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
    
    vi.useRealTimers();
  }, 10000); 
  
  it('sets up polling interval when token is available', async () => {
    await act(async () => {
      render(
        <AuthContext.Provider value={{ token: mockToken }}>
          <ApiKeys />
        </AuthContext.Provider>
      );
    });
    
    expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 5000);
  });
});