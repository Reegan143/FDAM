import { describe, it, beforeEach, afterEach, vi, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ResetPasswordRequest from './resetPasswordRequest';
import API from '../utils/axiosInstance';

vi.mock('../../utils/axiosInstance', () => ({
    user: {
        post: vi.fn(),
    },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

const renderComponent = () =>
    render(
        <BrowserRouter>
            <ResetPasswordRequest />
        </BrowserRouter>
    );

describe('ResetPasswordRequest Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the reset password form', () => {
        renderComponent();

        expect(screen.getByText('Reset Password')).toBeInTheDocument();
        expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /send otp/i })).toBeInTheDocument();
    });

    it('updates email input correctly', () => {
        renderComponent();

        const emailInput = screen.getByLabelText(/email address/i);
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

        expect(emailInput.value).toBe('test@example.com');
    });

});
