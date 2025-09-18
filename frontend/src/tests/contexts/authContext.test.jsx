import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import * as authService from '../../services/auth';
import * as profileService from '../../services/profile';
import { MemoryRouter } from "react-router-dom";

vi.mock('../../services/auth');
vi.mock('../../services/profile');

describe('AuthContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    // Use MemoryRouter in the wrapper
    const wrapper = ({ children }) => (
        <MemoryRouter>
            <AuthProvider>{children}</AuthProvider>
        </MemoryRouter>
    );

    it('should start with loading true when checking authentication', () => {
        localStorage.setItem('access', 'fake-token');
        profileService.fetchUserProfile.mockImplementation(() => new Promise(() => {}));
        
        const { result } = renderHook(() => useAuth(), { wrapper });

        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.loading).toBe(true);
    });

    it('should login successfully and set user', async () => {
        authService.login.mockResolvedValue({ access: 'token', refresh: 'refresh' });
        profileService.fetchUserProfile.mockResolvedValue({ email: 'test@example.com' });

        const { result } = renderHook(() => useAuth(), { wrapper });

        await act(async () => {
            await result.current.login('test@example.com', 'password');
        });

        expect(result.current.user).toEqual({ email: 'test@example.com' });
        expect(result.current.isAuthenticated).toBe(true);
    });

    it('should logout and clear user', () => {
        const { result } = renderHook(() => useAuth(), { wrapper });

        act(() => {
            result.current.logout();
        });

        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
    });
});
