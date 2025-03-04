import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import AdminSidebar from './adminSidebar';

// Mock modules
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    NavLink: ({ children, to, className }) => {
      // Simple mock of NavLink that renders the children and provides isActive function to className
      const isActive = to === '/admin/dashboard';
      return (
        <a 
          href={to} 
          className={typeof className === 'function' ? className({ isActive }) : className}
          data-testid={`navlink-${to.replace(/\//g, '-').substring(1)}`}
        >
          {children}
        </a>
      );
    }
  };
});

describe('AdminSidebar Component', () => {
  beforeEach(() => {
    // Reset any mocks between tests
    vi.resetAllMocks();
    
    // Set up viewport size for responsive tests
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024 // Default to desktop view
    });
  });

  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <AdminSidebar />
      </BrowserRouter>
    );
    
    expect(document.querySelector('.sidebar-wrapper')).toBeTruthy();
  });

  it('renders all menu items correctly', () => {
    render(
      <BrowserRouter>
        <AdminSidebar />
      </BrowserRouter>
    );
    
    // Check if all menu items are rendered
    expect(screen.getByText('Dashboard')).toBeTruthy();
    expect(screen.getByText('API Key Requests')).toBeTruthy();
    
    // Check if icons are present
    expect(document.querySelector('.fas.fa-home')).toBeTruthy();
    expect(document.querySelector('.fas.fa-key')).toBeTruthy();
  });

  it('applies active class to the active route', () => {
    render(
      <BrowserRouter>
        <AdminSidebar />
      </BrowserRouter>
    );
    
    // The dashboard link should be active based on our mock
    const dashboardLink = screen.getByTestId('navlink-admin-dashboard');
    const apiKeyLink = screen.getByTestId('navlink-admin-api-key-request');
    
    expect(dashboardLink.className).toContain('active');
    expect(apiKeyLink.className).not.toContain('active');
  });

  it('applies correct styling for desktop view', () => {
    // Ensure viewport is desktop size
    window.innerWidth = 1024;
    
    render(
      <BrowserRouter>
        <AdminSidebar />
      </BrowserRouter>
    );
    
    const sidebarWrapper = document.querySelector('.sidebar-wrapper');
    const computedStyle = window.getComputedStyle(sidebarWrapper);
    
    // We can't actually check computed styles in jsdom, but we can verify the class exists
    expect(sidebarWrapper).toBeTruthy();
    
    // Check if style tag is injected with desktop media query
    const styleTag = document.querySelector('style');
    expect(styleTag.textContent).toContain('@media (min-width: 768px)');
  });

  it('applies correct styling for mobile view', () => {
    // Simulate mobile viewport
    window.innerWidth = 600;
    window.dispatchEvent(new Event('resize'));
    
    render(
      <BrowserRouter>
        <AdminSidebar />
      </BrowserRouter>
    );
    
    const sidebarWrapper = document.querySelector('.sidebar-wrapper');
    expect(sidebarWrapper).toBeTruthy();
    
    // Check if style tag is injected with mobile media query
    const styleTag = document.querySelector('style');
    expect(styleTag.textContent).toContain('@media (max-width: 767.98px)');
  });

  it('renders the correct number of navigation links', () => {
    render(
      <BrowserRouter>
        <AdminSidebar />
      </BrowserRouter>
    );
    
    // There should be 2 links
    const navLinks = document.querySelectorAll('.nav-link');
    expect(navLinks.length).toBe(2);
  });

  it('contains correct href attributes for navigation links', () => {
    render(
      <BrowserRouter>
        <AdminSidebar />
      </BrowserRouter>
    );
    
    expect(screen.getByTestId('navlink-admin-dashboard').getAttribute('href')).toBe('/admin/dashboard');
    expect(screen.getByTestId('navlink-admin-api-key-request').getAttribute('href')).toBe('/admin/api-key-request');
  });

  it('injects global CSS styles correctly', () => {
    render(
      <BrowserRouter>
        <AdminSidebar />
      </BrowserRouter>
    );
    
    const styleTag = document.querySelector('style');
    expect(styleTag).toBeTruthy();
    expect(styleTag.textContent).toContain('.ms-250');
    expect(styleTag.textContent).toContain('.nav-link');
  });
});