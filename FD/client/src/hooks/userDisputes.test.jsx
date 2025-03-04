// userDisputes.test.jsx
import { renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useDisputes } from './userDisputes';

// Mock API
vi.mock('../components/utils/axiosInstance', () => ({
  default: {
    utils: {
      get: vi.fn()
    }
  }
}));

// Import the mocked API
import API from '../components/utils/axiosInstance';

describe('userDisputes Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    API.utils.get.mockResolvedValue({
      data: [
        { id: '1', status: 'pending' },
        { id: '2', status: 'resolved' }
      ]
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });


  test('should fetch disputes when token is provided', async () => {
    const { result } = renderHook(() => useDisputes('valid-token'));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(API.utils.get).toHaveBeenCalledWith('/disputes/me');
    expect(result.current.disputes).toEqual([
      { id: '1', status: 'pending' },
      { id: '2', status: 'resolved' }
    ]);
  });

  test('should not fetch disputes when token is not provided', () => {
    renderHook(() => useDisputes(null));
    
    expect(API.utils.get).not.toHaveBeenCalled();
  });

  test('should set up polling interval and clean up on unmount', async () => {
    const setIntervalSpy = vi.spyOn(global, 'setInterval');
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
    
    const { unmount } = renderHook(() => useDisputes('valid-token'));
    
    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 5000);
    
    unmount();
    
    expect(clearIntervalSpy).toHaveBeenCalled();
  });

  test('should handle error when fetching disputes', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    API.utils.get.mockRejectedValueOnce({ 
      response: { data: { message: 'Error fetching disputes' } } 
    });
    
    const { result } = renderHook(() => useDisputes('valid-token'));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error fetching disputes:',
      'Error fetching disputes'
    );
    expect(result.current.disputes).toEqual([]);
    
    consoleErrorSpy.mockRestore();
  });
});