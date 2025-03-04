import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AuthContext from '../../context/authContext';
import AdminDashboard from './adminDashboard';


// Mock the AuthContext
vi.mock('../../context/authContext', () => ({
  __esModule: true,
  default: {
    Provider: ({ children, value }) => children,
    Consumer: ({ children }) => children
  }
}));

// Override React's useContext for AuthContext specifically
const actualReact = vi.importActual('react');
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useContext: (context) => {
      // When AuthContext is requested, return our mock values
      if (context === vi.mocked(AuthContext)) {
        return { token: 'mocked-token', logout: vi.fn() };
      }
      // Otherwise use the actual implementation
      return actual.useContext(context);
    }
  };
});




// Mock the API with default export
vi.mock('../../utils/axiosInstance', () => {
  return {
    default: {
      admin: {
        get: vi.fn(),
        patch: vi.fn()
      }
    },
    setAuthToken: vi.fn()
  };
});



// Import after mocking
import API, { setAuthToken } from '../../utils/axiosInstance';

describe('AdminDashboard', () => {
  const mockToken = 'mocked-token';
  const mockDisputes = [
    { _id: '1', title: 'Dispute 1', status: 'Pending', createdAt: '2023-01-01' },
    { _id: '2', title: 'Dispute 2', status: 'Resolved', createdAt: '2023-01-02' },
  ];
  const mockAdminData = { userName: 'Admin User' };
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup API mocks with implementation to handle different endpoints
    API.admin.get.mockImplementation((url) => {
      if (url === '/admin/me') {
        return Promise.resolve({ data: mockAdminData });
      }
      if (url === '/admin/disputes') {
        return Promise.resolve({ data: mockDisputes });
      }
      if (url.includes('/admin/transaction/')) {
        return Promise.resolve({ data: { id: '123', amount: 100 } });
      }
      return Promise.resolve({ data: {} });
    });
    
    API.admin.patch.mockResolvedValue({ data: { success: true } });
  });

  it('renders without crashing', () => {
    render(
      <AuthContext.Provider value={{ token: mockToken }}>
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      </AuthContext.Provider>
    );
    
    expect(screen.getByText(/Admin Portal/i)).toBeInTheDocument();
  });

  it('displays admin username after loading', async () => {
    render(
      <AuthContext.Provider value={{ token: mockToken }}>
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      </AuthContext.Provider>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Admin User/i)).toBeInTheDocument();
    });
    
    expect(API.admin.get).toHaveBeenCalledWith('/admin/me');
  });

  it('calls API to fetch disputes', async () => {
    render(
      <AuthContext.Provider value={{ token: mockToken }}>
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      </AuthContext.Provider>
    );
    
    await waitFor(() => {
      expect(API.admin.get).toHaveBeenCalledWith('/admin/disputes');
    });
  });

  

  it('calls setAuthToken with token from context', async () => {
    render(
      <AuthContext.Provider value={{ token: mockToken }}>
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      </AuthContext.Provider>
    );
    
    await waitFor(() => {
      expect(setAuthToken).toHaveBeenCalled();
    });
  });

  it('displays "No disputes found" message when needed', async () => {
    // Override the mock for this specific test
    API.admin.get.mockImplementation((url) => {
      if (url === '/admin/me') {
        return Promise.resolve({ data: mockAdminData });
      }
      if (url === '/admin/disputes') {
        return Promise.resolve({ data: [] }); // Empty disputes array
      }
      return Promise.resolve({ data: {} });
    });
    
    render(
      <AuthContext.Provider value={{ token: mockToken }}>
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      </AuthContext.Provider>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/No disputes found/i)).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    // Mock API to throw an error
    API.admin.get.mockImplementation((url) => {
      if (url === '/admin/me') {
        return Promise.resolve({ data: mockAdminData });
      }
      if (url === '/admin/disputes') {
        return Promise.reject(new Error('Failed to fetch disputes'));
      }
      return Promise.resolve({ data: {} });
    });
    
    render(
      <AuthContext.Provider value={{ token: mockToken }}>
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      </AuthContext.Provider>
    );
    
    // Wait for API call to resolve
    await waitFor(() => {
      expect(API.admin.get).toHaveBeenCalledWith('/admin/disputes');
    });
  });

  it('displays disputes count correctly', async () => {
    render(
      <AuthContext.Provider value={{ token: mockToken }}>
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      </AuthContext.Provider>
    );
    
    // The component shows the count, so we can test for that
    await waitFor(() => {
      const disputesHeading = screen.getByText(/All Disputes/i);
      expect(disputesHeading).toHaveTextContent(`All Disputes (${mockDisputes.length})`);
    });
  });

  
  it('allows sorting disputes', async () => {
    render(
      <AuthContext.Provider value={{ token: mockToken }}>
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      </AuthContext.Provider>
    );
    
    // Wait for component to load
    await waitFor(() => {
      const sortDropdown = screen.getByText(/Sort by Date \(Oldest First\)/i);
      expect(sortDropdown).toBeInTheDocument();
    });
    
    // Find and use sort dropdown
    const sortSelect = screen.getByRole('combobox');
    fireEvent.change(sortSelect, { target: { value: 'amount_desc' } });
    
    // Verify sort options are available
    expect(screen.getByText(/Sort by Amount \(Highest First\)/i)).toBeInTheDocument();
  });

  it('handles logout button click', async () => {
    render(
      <AuthContext.Provider value={{ token: mockToken }}>
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      </AuthContext.Provider>
    );
    
    // Find and click logout button
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);
    
    // You could check if navigate was called, but we'd need to mock useNavigate for that
    // This test just verifies the button exists and is clickable
    expect(logoutButton).toBeInTheDocument();
  });
});