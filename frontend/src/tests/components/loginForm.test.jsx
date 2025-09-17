// src/tests/components/LoginForm.test.jsx

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import LoginForm from '../../components/LoginForm';
import * as AuthContext from '../../contexts/AuthContext';

// Mock react-router-dom for useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('LoginForm', () => {
    let authSpy;
    const mockOnLogin = vi.fn();
    const mockOnClose = vi.fn();
    const mockModalClose = vi.fn();

    beforeEach(() => {
        authSpy = vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
        login: vi.fn(),
        });


        vi.spyOn(document, 'getElementById').mockReturnValue({
        close: mockModalClose,
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    const renderComponent = () => {
        render(
        <MemoryRouter>
            <LoginForm onLogin={mockOnLogin} onClose={mockOnClose} />
        </MemoryRouter>
        );
    };

    it('should render the login form correctly', () => {
        renderComponent();
        expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should handle user input for email and password', async () => {
        const user = userEvent.setup();
        renderComponent();

        const emailInput = screen.getByPlaceholderText(/you@example.com/i);
        await user.type(emailInput, 'test@example.com');
        expect(emailInput).toHaveValue('test@example.com');

        const passwordInput = screen.getByPlaceholderText(/••••••••/i);
        await user.type(passwordInput, 'password123');
        expect(passwordInput).toHaveValue('password123');
    });

    it('should call login and redirect on successful submission', async () => {
        const user = userEvent.setup();
        const mockLogin = AuthContext.useAuth().login;
        mockLogin.mockResolvedValue({ success: true });

        renderComponent();

        await user.type(screen.getByPlaceholderText(/you@example.com/i), 'user@test.com');
        await user.type(screen.getByPlaceholderText(/••••••••/i), 'password');
        await user.click(screen.getByRole('button', { name: /sign in/i }));

        await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('user@test.com', 'password');
        expect(mockLogin).toHaveBeenCalledTimes(1);
        });

        expect(mockOnLogin).toHaveBeenCalled();
        expect(mockOnClose).toHaveBeenCalled();
        expect(mockModalClose).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/');

        expect(screen.getByPlaceholderText(/you@example.com/i)).toHaveValue('');
    });

    it('should display an error message on failed login', async () => {
        const user = userEvent.setup();
        const { login } = AuthContext.useAuth();
        const errorMessage = 'Invalid credentials';
        login.mockRejectedValue(new Error(errorMessage)); 

        renderComponent();

        await user.type(screen.getByPlaceholderText(/you@example.com/i), 'user@test.com');
        await user.type(screen.getByPlaceholderText(/••••••••/i), 'wrongpassword');
        await user.click(screen.getByRole('button', { name: /sign in/i }));

        expect(await screen.findByText(errorMessage)).toBeInTheDocument();

        expect(localStorage.getItem('userName')).toBeNull();
        expect(mockNavigate).not.toHaveBeenCalled();
        expect(mockOnLogin).not.toHaveBeenCalled();
        expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should disable the button and show loading text during submission', async () => {
        const user = userEvent.setup();
        const { login } = AuthContext.useAuth();
        const promise = new Promise(() => {}); 
        login.mockReturnValue(promise);

        renderComponent();

        await user.type(screen.getByPlaceholderText(/you@example.com/i), 'user@test.com');
        await user.type(screen.getByPlaceholderText(/••••••••/i), 'password');
        await user.click(screen.getByRole('button', { name: /sign in/i }));

        const loadingButton = screen.getByRole('button', { name: /signing in…/i });
        expect(loadingButton).toBeInTheDocument();
        expect(loadingButton).toBeDisabled();
    });
});