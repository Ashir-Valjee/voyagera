// src/tests/pages/profilePage.test.jsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ProfilePage from '../../pages/ProfilePage';
import * as AuthContext from '../../contexts/AuthContext';

vi.mock('../../services/profile');
vi.mock('../../services/flights');
vi.mock('../../services/city');
vi.mock('../../services/activity_booking');

describe('ProfilePage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should show login message when not authenticated', () => {
        vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
            isAuthenticated: false,
            loading: false
        });

        render(
            <MemoryRouter>
                <ProfilePage />
            </MemoryRouter>
        );

        expect(screen.getByText(/please log in to view your profile/i)).toBeInTheDocument();
    });

    it('should show loading when authenticated but data loading', () => {
        vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
            isAuthenticated: true,
            loading: false
        });

        render(
            <MemoryRouter>
                <ProfilePage />
            </MemoryRouter>
        );

        expect(screen.getByText(/loading your profile/i)).toBeInTheDocument();
    });
});
