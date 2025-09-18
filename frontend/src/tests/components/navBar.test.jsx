import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import * as AuthContext from '../../contexts/AuthContext';

describe('NavBar', () => {
    let mockLogout;
    
    beforeEach(() => {
        mockLogout = vi.fn();
        vi.clearAllMocks();
    });

    it('should show Sign In and Sign Up when not authenticated', () => {
        vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
            user: { firstName: 'Test', email: 'test@example.com', user: { email: 'test@example.com' } },
            isAuthenticated: false,
            loading: false,
            logout: mockLogout
        });

        render(
            <MemoryRouter>
                <NavBar />
            </MemoryRouter>
        );

        // Test that Sign In appears (might be multiple instances)
        expect(screen.getAllByText('Sign In')).toHaveLength(2); // Mobile + Desktop
        expect(screen.getAllByText('Sign Up')).toHaveLength(2); // Mobile + Desktop
        expect(screen.queryByText(/Welcome/)).not.toBeInTheDocument();
    });

    it('should show user info and logout when authenticated', () => {
        vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
            user: { firstName: 'Test', email: 'test@example.com', user: { email: 'test@example.com' } },
            isAuthenticated: true,
            loading: false,
            logout: mockLogout
        });

        render(
            <MemoryRouter>
                <NavBar />
            </MemoryRouter>
        );

        expect(screen.getByText('Welcome, Test!')).toBeInTheDocument();
        expect(screen.getAllByText('Logout')).toHaveLength(2); // Mobile + Desktop
        expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
    });

    it('should call logout when logout button is clicked', () => {
        vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
            user: { email: 'test@example.com' },
            isAuthenticated: true,
            loading: false,
            logout: mockLogout
        });

        render(
            <MemoryRouter>
                <NavBar />
            </MemoryRouter>
        );

        // Click the first logout button (desktop or mobile)
        const logoutButtons = screen.getAllByText('Logout');
        fireEvent.click(logoutButtons[0]);
        
        expect(mockLogout).toHaveBeenCalled();
    });
});
