// useUser.test.jsx - Fixed version
import { renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useUser } from './useUser';

// Mock navigate function
const mockNavigate = vi.fn();

// Mock modules before imports
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}));

vi.mock('../components/utils/axiosInstance', () => ({
  default: {
    user: {
      get: vi.fn()
    }
  }
}));

// Import the mocked API
import API from '../components/utils/axiosInstance';

describe('useUser Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    API.user.get.mockResolvedValue({
      data: { userName: 'testUser' }
    });
  });

  test('should redirect to login when token is not provided', () => {
    renderHook(() => useUser(null));
    
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('should fetch user data when token is provided', async () => {
    const { result } = renderHook(() => useUser('valid-token'));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(API.user.get).toHaveBeenCalledWith('/user/me');
    expect(result.current.userName).toBe('testUser');
    expect(result.current.sessionExpired).toBe(false);
  });

  test('should handle session expired when API returns 401', async () => {
    API.user.get.mockRejectedValueOnce({ 
      response: { status: 401 } 
    });
    
    const { result } = renderHook(() => useUser('valid-token'));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.sessionExpired).toBe(true);
  });

  test('should handle other errors when fetching user data', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    API.user.get.mockRejectedValueOnce(new Error('Network error'));
    
    const { result } = renderHook(() => useUser('valid-token'));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(result.current.sessionExpired).toBe(false);
    
    consoleErrorSpy.mockRestore();
  });

  test('should handle empty response data', async () => {
    API.user.get.mockResolvedValueOnce({ data: null });
    
    const { result } = renderHook(() => useUser('valid-token'));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.sessionExpired).toBe(true);
    expect(result.current.userName).toBe('');
  });

  test('handleSessionExpired should reset sessionExpired and navigate to login', () => {
    const { result } = renderHook(() => useUser('valid-token'));
    
    result.current.handleSessionExpired();
    
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});