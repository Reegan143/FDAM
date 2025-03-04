import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import VendorSidebar from './vendorSidebar';

describe('VendorSidebar Component', () => {
  // Rendering helper function
  const renderSidebar = (initialRoute = '/') => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <VendorSidebar />
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
      'Fetch Transaction Details'
    ];

    expectedMenuItems.forEach(item => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
  });

  // Navigation paths test
  it('creates links with correct paths', () => {
    renderSidebar();
    
    const expectedPaths = [
      '/vendor/dashboard',
      '/vendor/api-keys'
    ];

    const links = screen.getAllByRole('link');
    expectedPaths.forEach((path, index) => {
      expect(links[index]).toHaveAttribute('href', path);
    });
  });

  // Active route highlighting test
  it('applies active class to the current route', () => {
    renderSidebar('/vendor/dashboard');
    
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveClass('nav-link');
    expect(dashboardLink).toHaveClass('active');
  });

  // Icons rendering test
  it('renders icons for each menu item', () => {
    renderSidebar();
    
    const expectedIcons = [
      '.fas.fa-home',
      '.fas.fa-lock'
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
      { label: 'Fetch Transaction Details', icon: 'fas fa-lock' }
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

  // CSS classes test
  it('applies correct CSS classes to menu items', () => {
    renderSidebar();
    
    const links = screen.getAllByRole('link');
    
    links.forEach(link => {
      expect(link).toHaveClass('nav-link');
      
      const icon = link.querySelector('i');
      expect(icon).toHaveClass('me-2');
    });
  });

  // Specific style checks
  it('checks specific CSS properties', () => {
    renderSidebar();
    
    const styleTag = document.querySelector('style');
    const styleContent = styleTag.textContent;
    
    // Check for specific CSS rules
    expect(styleContent).toContain('.ms-250');
    expect(styleContent).toContain('margin-left: 250px');
    expect(styleContent).toContain('.nav-link i');
    expect(styleContent).toContain('width: 20px');
    expect(styleContent).toContain('text-align: center');
  });
});