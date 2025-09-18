// src/tests/components/protectedRoute.test.jsx

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';
import * as AuthContext from '../../contexts/AuthContext';

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        Navigate: vi.fn(({ to }) => <div>Redirecting to {to}</div>),
    };
});

const ProtectedContent = () => <div>This is protected content</div>;

describe('ProtectedRoute', () => {
    let authSpy;
    beforeEach(() => {
        vi.clearAllMocks(); 
        authSpy = vi.spyOn(AuthContext, 'useAuth');
    });

    it('should show a loading spinner when authentication is loading', () => {
        authSpy.mockReturnValue({
        loading: true,
        user: null,
        });

        render(<ProtectedRoute><ProtectedContent /></ProtectedRoute>);

    });

    it('should render a redirect component if the user is not authenticated', () => {
        authSpy.mockReturnValue({
        loading: false,
        user: null,
        });

        render(
        <MemoryRouter>
            <ProtectedRoute>
            <ProtectedContent />
            </ProtectedRoute>
        </MemoryRouter>
        );
        
        expect(screen.getByText(/Redirecting to\s*\//)).toBeInTheDocument();
        expect(screen.queryByText('This is protected content')).not.toBeInTheDocument();
    });

    it('should render the children components if the user is authenticated', () => {
        authSpy.mockReturnValue({
        loading: false,
        user: { email: 'test@example.com' },
        });

        render(
        <ProtectedRoute>
            <ProtectedContent />
        </ProtectedRoute>
        );

        expect(screen.getByText('This is protected content')).toBeInTheDocument();
    });
});