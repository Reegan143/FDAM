import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { act } from 'react-dom/test-utils';
import ResetPasswordForm from './resetForm';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        useNavigate: () => mockNavigate, 
    };
});

vi.mock('../utils/axiosInstance', () => {
    return {
        __esModule: true, 
        default: {
            user: {
                post: vi.fn(),
            },
            admin: {
                post: vi.fn(),
            },
            vendor: {
                post: vi.fn(),
            },
            utils: {
                post: vi.fn(),
            },
            auth: {
                post: vi.fn(),
            },
        },
    };
});

import API from '../utils/axiosInstance';

describe('ResetPasswordForm Component', () => {
    beforeEach(() => {
        vi.resetAllMocks(); 
    });

    it('renders the form correctly', () => {
        render(
            <MemoryRouter>
                <ResetPasswordForm />
            </MemoryRouter>
        );

        expect(screen.getByText('Reset Your Password')).toBeInTheDocument();
        expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/OTP/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Reset Password/i })).toBeInTheDocument();
    });

    it('handles input changes correctly', async () => {
        render(
            <MemoryRouter>
                <ResetPasswordForm />
            </MemoryRouter>
        );

        const emailInput = screen.getByLabelText(/Email address/i);
        const otpInput = screen.getByLabelText(/OTP/i);
        const passwordInput = screen.getByLabelText(/New Password/i);

        await userEvent.type(emailInput, 'test@example.com');
        await userEvent.type(otpInput, '123456');
        await userEvent.type(passwordInput, 'newPassword123');

        expect(emailInput.value).toBe('test@example.com');
        expect(otpInput.value).toBe('123456');
        expect(passwordInput.value).toBe('newPassword123');
    });



});
