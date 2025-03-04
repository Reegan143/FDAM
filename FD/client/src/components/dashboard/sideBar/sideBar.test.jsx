import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from './sidebar';

describe('Sidebar Component', () => {
  // Rendering helper function
  const renderSidebar = (initialRoute = '/') => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <Sidebar />
      </MemoryRouter>
    );
  };

  // Basic rendering test
  it('renders without crashing', () => {
    renderSidebar();
  });

  // Menu items rendering test
  it('renders all menu items correctly', () => {
    renderSidebar();
    
    const expectedMenuItems = [
      'Dashboard',
      'Transactions',
      'Track Existing Complaints'
    ];

    expectedMenuItems.forEach(item => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
  });

  // Navigation paths test
  it('creates links with correct paths', () => {
    renderSidebar();
    
    const expectedPaths = [
      '/dashboard',
      '/user/transactions',
      '/dispute-status'
    ];

    const links = screen.getAllByRole('link');
    expectedPaths.forEach((path, index) => {
      expect(links[index]).toHaveAttribute('href', path);
    });
  });

  // Active route highlighting test
  it('applies active class to the current route', () => {
    renderSidebar('/dashboard');
    
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveClass('nav-link');
    expect(dashboardLink).toHaveClass('active');
  });

  // Icons rendering test
  it('renders icons for each menu item', () => {
    renderSidebar();
    
    const expectedIcons = [
      '.fas.fa-home',
      '.fas.fa-exchange-alt',
      '.fas.fa-tasks'
    ];

    expectedIcons.forEach(iconClass => {
      const icon = document.querySelector(iconClass);
      expect(icon).toBeInTheDocument();
    });
  });

  // Inline styles and CSS test
  it('applies correct styles to sidebar wrapper', () => {
    const { container } = renderSidebar();
    
    const sidebarWrapper = container.querySelector('.sidebar-wrapper');
    const sidebarNav = container.querySelector('.sidebar-nav');
    
    expect(sidebarWrapper).toBeInTheDocument();
    expect(sidebarNav).toBeInTheDocument();

    // Check for injected style tag
    const styleTag = container.querySelector('style');
    expect(styleTag).toBeInTheDocument();
    
    // Check style content
    const styleContent = styleTag.textContent;
    expect(styleContent).toContain('.sidebar-wrapper');
    expect(styleContent).toContain('.sidebar-nav');
    expect(styleContent).toContain('@media (min-width: 768px)');
    expect(styleContent).toContain('@media (max-width: 767.98px)');
  });

  // Global CSS injection test
  it('injects global CSS styles', () => {
    renderSidebar();
    
    const styleElements = document.querySelectorAll('style');
    const globalCssElement = Array.from(styleElements).find(
      style => style.textContent.includes('.nav-link')
    );
    
    expect(globalCssElement).toBeTruthy();
    expect(globalCssElement.textContent).toContain('.nav-link');
    expect(globalCssElement.textContent).toContain('.nav-link:hover');
    expect(globalCssElement.textContent).toContain('.nav-link.active');
  });

  // Responsive design test
  it('has responsive design classes', () => {
    const { container } = renderSidebar();
    
    const sidebarWrapper = container.querySelector('.sidebar-wrapper');
    const sidebarNav = container.querySelector('.sidebar-nav');
    
    expect(sidebarWrapper).toHaveClass('sidebar-wrapper');
    expect(sidebarNav).toHaveClass('sidebar-nav');
  });

  // Menu items structure test
  it('renders menu items with correct structure', () => {
    const { container } = renderSidebar();
    
    const menuItems = [
      { label: 'Dashboard', icon: 'fas fa-home' },
      { label: 'Transactions', icon: 'fas fa-exchange-alt' },
      { label: 'Track Existing Complaints', icon: 'fas fa-tasks' }
    ];

    menuItems.forEach(item => {
      // Find the link by text
      const link = screen.getByText(item.label).closest('a');
      expect(link).toBeInTheDocument();
      
      // Check for icon within the link
      const icon = link.querySelector(`i.${item.icon.replace(/ /g, '.')}`);
      expect(icon).toBeInTheDocument();
    });
  });
});