import React from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Header from './header';
import { BrowserRouter } from 'react-router-dom';
import AuthContext from '../../context/authContext';
import API from '../../utils/axiosInstance';

// Mock dependencies
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

vi.mock('../../utils/axiosInstance', () => ({
  default: {
    utils: {
      get: vi.fn(),
      patch: vi.fn()
    }
  }
}));

// Our NotificationsPopup mock now properly renders the passed notifications
vi.mock('../../notification/notification', () => ({
  default: ({ showNotifications, notifications, markAsRead, onClose, unreadCount }) => (
    showNotifications ? (
      <div data-testid="notifications-popup">
        <div>Notifications: {notifications.length}</div>
        <div>Unread: {unreadCount}</div>
        <button onClick={onClose} data-testid="close-notifications">Close</button>
        {notifications && notifications.map(notification => (
          <div key={notification._id} data-testid={`notification-${notification._id}`}>
            <span>{notification.message}</span>
            {!notification.isRead && (
              <button 
                onClick={() => markAsRead(notification._id)}
                data-testid={`mark-read-${notification._id}`}
              >
                Mark as read
              </button>
            )}
          </div>
        ))}
      </div>
    ) : null
  )
}));

// Mock navigator
const mockNavigate = vi.fn();

// Mock window.location.reload
const originalLocation = window.location;
beforeEach(() => {
  delete window.location;
  window.location = { reload: vi.fn() };
});

afterEach(() => {
  window.location = originalLocation;
  vi.resetAllMocks();
});

// Test notifications data
const mockNotifications = [
  { _id: '1', message: 'Notification 1', isRead: false },
  { _id: '2', message: 'Notification 2', isRead: true },
  { _id: '3', message: 'Notification 3', isRead: false }
];

describe('Header Component', () => {
  const mockLogout = vi.fn();
  const mockToken = 'test-token';

  const renderHeader = () => {
    return render(
      <BrowserRouter>
        <AuthContext.Provider value={{ logout: mockLogout, token: mockToken }}>
          <Header />
        </AuthContext.Provider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Setup API mock response
    API.utils.get.mockResolvedValue({ data: mockNotifications });
    API.utils.patch.mockResolvedValue({});
    
    // Mock setInterval and setTimeout
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render the header with logo and name', async () => {
    // Wrap in act because fetchNotifications will trigger state updates
    await act(async () => {
      renderHeader();
    });
    
    // Check logo and name
    const logo = screen.getByAltText('Brillian Bank');
    expect(logo).toBeInTheDocument();
    expect(screen.getByText('Brillian Bank')).toBeInTheDocument();
  });

  it('should fetch notifications on mount', async () => {
    await act(async () => {
      renderHeader();
    });
    
    // Check that API was called correctly
    expect(API.utils.get).toHaveBeenCalledWith('/notifications');
  });

  it('should periodically fetch notifications', async () => {
    await act(async () => {
      renderHeader();
    });
    
    // First fetch on mount
    expect(API.utils.get).toHaveBeenCalledTimes(1);
    
    // Fast-forward 5 seconds
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });
    
    // Should call again after 5 seconds
    expect(API.utils.get).toHaveBeenCalledTimes(2);
  });

  it('should display notification badge with unread count', async () => {
    await act(async () => {
      renderHeader();
    });
    
    // 2 unread in our mock data
    const badge = screen.getByText('2');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-danger');
  });

  it('should toggle notification panel when bell icon is clicked', async () => {
    await act(async () => {
      renderHeader();
    });
    
    // Notifications should not be visible initially (removed in previous test)
    expect(screen.queryByTestId('notifications-popup')).not.toBeInTheDocument();
    
    // Click the bell icon
    await act(async () => {
      fireEvent.click(screen.getByTestId('notification-toggle'));
    });
    
    // Notifications should be visible
    expect(screen.getByTestId('notifications-popup')).toBeInTheDocument();
    
    // Click again to hide
    await act(async () => {
      fireEvent.click(screen.getByTestId('notification-toggle'));
    });
    
    // Notifications should be hidden
    expect(screen.queryByTestId('notifications-popup')).not.toBeInTheDocument();
  });

  it('should close notification panel when clicking outside', async () => {
    await act(async () => {
      renderHeader();
    });
    
    // Click the bell icon to show notifications
    await act(async () => {
      fireEvent.click(screen.getByTestId('notification-toggle'));
    });
    
    // Notifications should be visible
    expect(screen.getByTestId('notifications-popup')).toBeInTheDocument();
    
    // Click outside
    await act(async () => {
      fireEvent.mouseDown(document.body);
    });
    
    // Notifications should be hidden
    expect(screen.queryByTestId('notifications-popup')).not.toBeInTheDocument();
  });

  it('should mark notification as read when clicked', async () => {
    // We need to resolve the API call with our mockNotifications data
    API.utils.get.mockResolvedValue({ data: mockNotifications });
    
    await act(async () => {
      renderHeader();
    });
    
    // Click the bell icon to show notifications
    await act(async () => {
      fireEvent.click(screen.getByTestId('notification-toggle'));
    });
    
    // Ensure our notification appears in the popup
    expect(screen.getByTestId('notification-1')).toBeInTheDocument();
    
    // Find an unread notification and mark it as read
    const markReadButton = screen.getByTestId('mark-read-1');
    
    await act(async () => {
      fireEvent.click(markReadButton);
    });
    
    // Check that the API was called with the correct ID
    expect(API.utils.patch).toHaveBeenCalledWith('/notifications/1/read');
  });

  it('should navigate to home page when logo is clicked', async () => {
    await act(async () => {
      renderHeader();
    });
    
    // Click on the logo
    await act(async () => {
      fireEvent.click(screen.getByAltText('Brillian Bank'));
    });
    
    // Check navigation was called
    expect(mockNavigate).toHaveBeenCalledWith('/');
    expect(window.location.reload).toHaveBeenCalled();
  });

  it('should navigate to settings page when user icon is clicked', async () => {
    await act(async () => {
      renderHeader();
    });
    
    // Click on the settings button
    await act(async () => {
      fireEvent.click(screen.getByTestId('settings-button'));
    });
    
    // Check navigation was called
    expect(mockNavigate).toHaveBeenCalledWith('/user/settings');
  });

  it('should logout when logout button is clicked', async () => {
    await act(async () => {
      renderHeader();
    });
    
    // Click on the logout button
    await act(async () => {
      fireEvent.click(screen.getByText('Logout'));
    });
    
    // Check logout was called
    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
    expect(window.location.reload).toHaveBeenCalled();
  });

  it('should remove event listener on unmount', async () => {
    // Spy on addEventListener and removeEventListener
    const addEventSpy = vi.spyOn(document, 'addEventListener');
    const removeEventSpy = vi.spyOn(document, 'removeEventListener');
    
    let result;
    await act(async () => {
      result = renderHeader();
    });
    
    // Check that event listener was added
    expect(addEventSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
    
    // Unmount component
    await act(async () => {
      result.unmount();
    });
    
    // Check that event listener was removed
    expect(removeEventSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
  });

  it('should not show notification badge when there are no unread notifications', async () => {
    // Mock no unread notifications
    API.utils.get.mockResolvedValue({ data: [
      { _id: '1', message: 'Notification 1', isRead: true },
      { _id: '2', message: 'Notification 2', isRead: true }
    ]});
    
    await act(async () => {
      renderHeader();
    });
    
    // No badge should be shown (for unread count)
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('should handle API errors when fetching notifications', async () => {
    // Mock API error
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    API.utils.get.mockRejectedValue(new Error('API error'));
    
    await act(async () => {
      renderHeader();
    });
    
    // Should log error
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error fetching notifications:', 
      expect.any(Error)
    );
    
    consoleErrorSpy.mockRestore();
  });

  it('should handle API errors when marking notifications as read', async () => {
    // Mock API error for patch but success for get
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    API.utils.get.mockResolvedValue({ data: mockNotifications });
    API.utils.patch.mockRejectedValue(new Error('API error'));
    
    await act(async () => {
      renderHeader();
    });
    
    // Click the bell icon to show notifications
    await act(async () => {
      fireEvent.click(screen.getByTestId('notification-toggle'));
    });
    
    // Find an unread notification and try to mark it as read
    const markReadButton = screen.getByTestId('mark-read-1');
    await act(async () => {
      fireEvent.click(markReadButton);
    });
    
    // Should log error
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error marking as read:', 
      expect.any(Error)
    );
    
    consoleErrorSpy.mockRestore();
  });
});