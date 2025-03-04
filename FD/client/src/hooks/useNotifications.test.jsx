// useNotifications.test.jsx
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNotifications } from './useNotifications';

describe('useNotifications', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with empty notifications array', () => {
    const { result } = renderHook(() => useNotifications());
    expect(result.current.notifications).toEqual([]);
  });

  it('should add notification with default success variant', () => {
    const { result } = renderHook(() => useNotifications());
    
    act(() => {
      result.current.addNotification('Test notification');
    });
    
    expect(result.current.notifications.length).toBe(1);
    expect(result.current.notifications[0].message).toBe('Test notification');
    expect(result.current.notifications[0].variant).toBe('success');
    expect(result.current.notifications[0].id).toBeDefined();
  });

  it('should add notification with custom variant', () => {
    const { result } = renderHook(() => useNotifications());
    
    act(() => {
      result.current.addNotification('Error notification', 'danger');
    });
    
    expect(result.current.notifications.length).toBe(1);
    expect(result.current.notifications[0].message).toBe('Error notification');
    expect(result.current.notifications[0].variant).toBe('danger');
  });

  it('should remove notification after 5 seconds', () => {
    const { result } = renderHook(() => useNotifications());
    
    act(() => {
      result.current.addNotification('Test notification');
    });
    
    expect(result.current.notifications.length).toBe(1);
    
    // Fast-forward time by 5 seconds
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    
    expect(result.current.notifications.length).toBe(0);
  });

  it('should handle multiple notifications correctly', () => {
    const { result } = renderHook(() => useNotifications());
    
    // Add first notification
    act(() => {
      result.current.addNotification('First notification');
    });
    
    // Add second notification
    act(() => {
      result.current.addNotification('Second notification', 'warning');
    });
    
    // Verify both notifications are present
    expect(result.current.notifications.length).toBe(2);
    expect(result.current.notifications[0].message).toBe('First notification');
    expect(result.current.notifications[0].variant).toBe('success');
    expect(result.current.notifications[1].message).toBe('Second notification');
    expect(result.current.notifications[1].variant).toBe('warning');
    
    // Fast-forward time by 5 seconds (should remove both notifications)
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    
    expect(result.current.notifications.length).toBe(0);
  });
});