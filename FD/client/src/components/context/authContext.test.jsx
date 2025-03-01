import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { useContext } from 'react';
import { AuthContext, AuthProvider } from './authContext';

describe('AuthContext and AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const TestComponent = () => {
    const { token, login, logout, getToken } = useContext(AuthContext);
    
    return (
      <div>
        <div data-testid="token-value">{token || 'no-token'}</div>
        <div data-testid="get-token-value">{getToken() || 'no-token'}</div>
        <button data-testid="login-button" onClick={() => login('test-token')}>Login</button>
        <button data-testid="logout-button" onClick={logout}>Logout</button>
      </div>
    );
  };

  it('should provide default values with null token', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('token-value').textContent).toBe('no-token');
    expect(screen.getByTestId('get-token-value').textContent).toBe('no-token');
  });

  it('should update token when login is called', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('token-value').textContent).toBe('no-token');
    
    act(() => {
      screen.getByTestId('login-button').click();
    });
    
    expect(screen.getByTestId('token-value').textContent).toBe('test-token');
    expect(screen.getByTestId('get-token-value').textContent).toBe('test-token');
  });

  it('should clear token when logout is called', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    act(() => {
      screen.getByTestId('login-button').click();
    });
    
    expect(screen.getByTestId('token-value').textContent).toBe('test-token');
    
    act(() => {
      screen.getByTestId('logout-button').click();
    });
    
    expect(screen.getByTestId('token-value').textContent).toBe('no-token');
    expect(screen.getByTestId('get-token-value').textContent).toBe('no-token');
  });

  it('should maintain context value stability during renders', () => {
    let renderCount = 0;
    let contextValuesCaptures = [];
    
    const ContextCapture = () => {
      const contextValue = useContext(AuthContext);
      if (renderCount < 2) {
        contextValuesCaptures.push(contextValue);
      }
      renderCount++;
      return null;
    };
    
    const { rerender } = render(
      <AuthProvider>
        <ContextCapture />
      </AuthProvider>
    );
    
    rerender(
      <AuthProvider>
        <ContextCapture />
      </AuthProvider>
    );
    
    expect(contextValuesCaptures[0].token).toBe(null);
    expect(contextValuesCaptures[1].token).toBe(null);
    
    expect(contextValuesCaptures[0]).toHaveProperty('token');
    expect(contextValuesCaptures[0]).toHaveProperty('login');
    expect(contextValuesCaptures[0]).toHaveProperty('logout');
    expect(contextValuesCaptures[0]).toHaveProperty('getToken');
  });

  it('should update context value correctly when token changes', () => {
    const TokenDisplay = () => {
      const { token, login } = useContext(AuthContext);
      return (
        <div>
          <div data-testid="token-display">{token || 'no-token'}</div>
          <button data-testid="update-token" onClick={() => login('updated-token')}>
            Update Token
          </button>
        </div>
      );
    };
    
    render(
      <AuthProvider>
        <TokenDisplay />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('token-display').textContent).toBe('no-token');
    
    act(() => {
      screen.getByTestId('update-token').click();
    });
    
    expect(screen.getByTestId('token-display').textContent).toBe('updated-token');
  });

  it('should expose the correct token value through getToken function', () => {
    const { rerender } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('get-token-value').textContent).toBe('no-token');
    
    act(() => {
      screen.getByTestId('login-button').click();
    });
    
    rerender(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('get-token-value').textContent).toBe('test-token');
  });
});