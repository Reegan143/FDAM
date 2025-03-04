// home.test.jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HomePage from './home';
import { useNavigate } from 'react-router-dom';

// Mock react-router-dom's useNavigate
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn()
}));

describe('HomePage', () => {
  const mockNavigate = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
  });
  
  it('renders correctly with all sections', () => {
    render(<HomePage />);
    
    // Check navbar
    expect(screen.getByText('Brillian Bank')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    
    // Check hero section
    expect(screen.getByText('Welcome to Brillian Bank')).toBeInTheDocument();
    
    // Check about section
    expect(screen.getByText('About Brillian Bank')).toBeInTheDocument();
    
    // Check why choose us section
    expect(screen.getByText('Why Choose Our Dispute Management System?')).toBeInTheDocument();
    
    // Check services section
    expect(screen.getByText('Our Services')).toBeInTheDocument();
    expect(screen.getByText('Personal Banking')).toBeInTheDocument();
    expect(screen.getByText('Business Banking')).toBeInTheDocument();
    expect(screen.getByText('Digital Banking')).toBeInTheDocument();
    
    // Check testimonials section
    expect(screen.getByText('Customer Testimonials')).toBeInTheDocument();
    
    // Check contact section
    expect(screen.getByText('Get in Touch')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Contact Us' })).toBeInTheDocument();
    
    // Check footer
    expect(screen.getByText(/Brillian Bank © 2025/)).toBeInTheDocument();
  });
  
  it('navigates to login page when login button is clicked', () => {
    render(<HomePage />);
    
    const loginButton = screen.getByRole('button', { name: 'Login' });
    fireEvent.click(loginButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
  
  it('navigates to contact page when contact us button is clicked', () => {
    render(<HomePage />);
    
    const contactButton = screen.getByRole('button', { name: 'Contact Us' });
    fireEvent.click(contactButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/contact');
  });
  
  it('renders all testimonials correctly', () => {
    render(<HomePage />);
    
    expect(screen.getByText(/Brillian Bank has transformed my banking experience/)).toBeInTheDocument();
    expect(screen.getByText(/Jane Doe/)).toBeInTheDocument();
    
    expect(screen.getByText(/I trust Brillian Bank for all my business needs/)).toBeInTheDocument();
    expect(screen.getByText(/John Smith/)).toBeInTheDocument();
    
    expect(screen.getByText(/The digital banking platform is intuitive and efficient/)).toBeInTheDocument();
    expect(screen.getByText(/Emily Johnson/)).toBeInTheDocument();
  });
  
  it('renders service benefits list items correctly', () => {
    render(<HomePage />);
    
    expect(screen.getByText('✓ Fast response time')).toBeInTheDocument();
    expect(screen.getByText('✓ Efficient tracking of disputes')).toBeInTheDocument();
    expect(screen.getByText('✓ Real-time notifications and updates')).toBeInTheDocument();
    expect(screen.getByText('✓ 24/7 support')).toBeInTheDocument();
    expect(screen.getByText('✓ Secure and confidential handling')).toBeInTheDocument();
    expect(screen.getByText('✓ Easy-to-use platform')).toBeInTheDocument();
  });
  
  it('renders the bank logo image correctly', () => {
    render(<HomePage />);
    
    const logoImage = screen.getByAltText('Brillian Bank Logo');
    expect(logoImage).toBeInTheDocument();
    expect(logoImage.getAttribute('src')).toBe('https://mma.prnewswire.com/media/2171380/Brillio_Logo.jpg?p=twitter');
  });
});