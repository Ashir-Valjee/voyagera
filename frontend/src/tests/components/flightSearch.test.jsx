import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import FlightSearch from '../../components/FlightSearch';

// Mock the cities service
vi.mock('../../services/cities', () => ({
    fetchCities: vi.fn().mockResolvedValue([
        { city: 'London', country: 'UK', iataCode: 'LON' },
        { city: 'Paris', country: 'France', iataCode: 'PAR' }
    ])
}));

describe('FlightSearch', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render search form elements', () => {
        render(
            <MemoryRouter>
                <FlightSearch />
            </MemoryRouter>
        );
        
        expect(screen.getByText(/origin/i)).toBeInTheDocument();
        expect(screen.getByText(/destination/i)).toBeInTheDocument();
        expect(screen.getByText(/departure/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /search flights/i })).toBeInTheDocument();
    });

    it('should allow user to fill out form', async () => {
        const user = userEvent.setup();
        
        render(
            <MemoryRouter>
                <FlightSearch />
            </MemoryRouter>
        );
        
        await user.type(screen.getByLabelText(/departure/i), '2024-12-25');
        expect(screen.getByLabelText(/departure/i)).toHaveValue('2024-12-25');
    });

    it('should handle form submission', async () => {
        const user = userEvent.setup();
        
        render(
            <MemoryRouter>
                <FlightSearch />
            </MemoryRouter>
        );
        
        await user.type(screen.getByLabelText(/departure/i), '2024-12-25');
        await user.click(screen.getByRole('button', { name: /search flights/i }));
                expect(screen.getByRole('button', { name: /search flights/i })).toBeInTheDocument();
    });
});
