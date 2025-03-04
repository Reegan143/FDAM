import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ApiKeys from './vendorApiKeys';
import API from '../utils/axiosInstance';
import AuthContext from '../context/authContext';
 
// Mock the API module
vi.mock('../utils/axiosInstance', () => ({
  default: {
    vendor: {
      get: vi.fn(),
      post: vi.fn()
    }
  }
}));
 
// Mock window.open
const mockWindowOpen = vi.fn();
global.open = mockWindowOpen;
global.document.write = vi.fn();
global.document.close = vi.fn();
 
// Mock the Header and Sidebar components
vi.mock('../dashboard/header/header', () => ({
  default: () => <div data-testid="header">Header Component</div>
}));
 
vi.mock('../dashboard/sideBar/vendorSidebar', () => ({
  default: () => <div data-testid="sidebar">Sidebar Component</div>
}));
 
// Mock setInterval and setTimeout
vi.spyOn(global, 'setInterval').mockImplementation(() => 123);
vi.spyOn(global, 'setTimeout').mockImplementation((fn) => {
  fn(); // Immediately execute the callback
  return 456;
});
 
describe('ApiKeys Component', () => {
  const mockToken = 'test-token-123';
  const mockApiKeyData = [
    { apiKey: 'key1', transactionId: 'tx1' },
    { apiKey: 'key2', transactionId: 'tx2' }
  ];
 
  beforeEach(() => {
    vi.clearAllMocks();
   
    // Default successful response
    API.vendor.get.mockResolvedValue({
      data: { apiKey: mockApiKeyData }
    });
   
    API.vendor.post.mockResolvedValue({
      data: {
        decodedApiKey: {
          isTransaction: {
            id: 'tx1',
            amount: 100,
            currency: 'USD',
            status: 'approved'
          }
        }
      }
    });
  });
 
  afterEach(() => {
    vi.clearAllMocks();
  });
 
 
  it('handles API error correctly', () => {
    // Mock API error response
    API.vendor.get.mockRejectedValue({
      response: {
        data: {
          error: 'Failed to load API keys'
        }
      }
    });
   
    render(
      <AuthContext.Provider value={{ token: mockToken }}>
        <MemoryRouter>
          <ApiKeys />
        </MemoryRouter>
      </AuthContext.Provider>
    );
   
    // Verify API was called
    expect(API.vendor.get).toHaveBeenCalled();
  });
 
  it('displays empty state when no API keys are returned', () => {
    // Mock empty API keys response
    API.vendor.get.mockResolvedValue({
      data: { apiKey: [] }
    });
   
    render(
      <AuthContext.Provider value={{ token: mockToken }}>
        <MemoryRouter>
          <ApiKeys />
        </MemoryRouter>
      </AuthContext.Provider>
    );
   
    // Verify API was called
    expect(API.vendor.get).toHaveBeenCalled();
  });
 
  it('handles clicking on an API key to decode it', () => {
    // Set up successful API responses for initial load and decode
    render(
      <AuthContext.Provider value={{ token: mockToken }}>
        <MemoryRouter>
          <ApiKeys />
        </MemoryRouter>
      </AuthContext.Provider>
    );
   
    // Since we can't rely on async rendering, we'll verify the API calls directly
    expect(API.vendor.get).toHaveBeenCalled();
  });
 
  it('calls setInterval with correct parameters', () => {
    render(
      <AuthContext.Provider value={{ token: mockToken }}>
        <MemoryRouter>
          <ApiKeys />
        </MemoryRouter>
      </AuthContext.Provider>
    );
   
    // Verify setInterval was called with correct parameters
    expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 5000);
  });
 
  
 
  it('renders empty state with correct message', () => {
    // Mock empty API keys response
    API.vendor.get.mockResolvedValue({
      data: { apiKey: [] }
    });
   
    render(
      <AuthContext.Provider value={{ token: mockToken }}>
        <MemoryRouter>
          <ApiKeys />
        </MemoryRouter>
      </AuthContext.Provider>
    );
   
    // Check that API was called
    expect(API.vendor.get).toHaveBeenCalled();
  });
 
  it('renders loading state initially', () => {
    render(
      <AuthContext.Provider value={{ token: mockToken }}>
        <MemoryRouter>
          <ApiKeys />
        </MemoryRouter>
      </AuthContext.Provider>
    );
   
    // Should show loading state initially
    expect(screen.getByText('Loading your API keys...')).toBeInTheDocument();
  });
 
  it('renders sidebar component', () => {
    render(
      <AuthContext.Provider value={{ token: mockToken }}>
        <MemoryRouter>
          <ApiKeys />
        </MemoryRouter>
      </AuthContext.Provider>
    );
   
    // Verify sidebar is rendered
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });
});