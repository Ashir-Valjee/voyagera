// src/tests/contexts/authContext.test.jsx
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import * as authService from '../../services/auth';
import * as userService from '../../services/user';

vi.mock('../../services/auth');
vi.mock('../../services/user');

describe('AuthContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('should start with loading true when checking authentication', () => {
        localStorage.setItem('access', 'fake-token');
        userService.default.mockImplementation(() => new Promise(() => {}));
        
        const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
        const { result } = renderHook(() => useAuth(), { wrapper });

        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.loading).toBe(true);
    });

    it('should login successfully and set user', async () => {
        authService.login.mockResolvedValue({ access: 'token', refresh: 'refresh' });
        userService.default.mockResolvedValue({ email: 'test@example.com' });

        const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
        const { result } = renderHook(() => useAuth(), { wrapper });

        await act(async () => {
            await result.current.login('test@example.com', 'password');
        });

        expect(result.current.user).toEqual({ email: 'test@example.com' });
        expect(result.current.isAuthenticated).toBe(true);
    });

    it('should logout and clear user', () => {
        const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
        const { result } = renderHook(() => useAuth(), { wrapper });

        act(() => {
            result.current.logout();
        });

        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
    });
});
