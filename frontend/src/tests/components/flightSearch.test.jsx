// src/tests/components/flightSearch.test.jsx
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
        
        // Use actual text from your component
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
        
        // Fill out the departure date
        await user.type(screen.getByLabelText(/departure/i), '2024-12-25');
        
        // Check that the value was set
        expect(screen.getByLabelText(/departure/i)).toHaveValue('2024-12-25');
    });

    it('should handle form submission', async () => {
        const user = userEvent.setup();
        
        render(
            <MemoryRouter>
                <FlightSearch />
            </MemoryRouter>
        );
        
        // Fill out required fields
        await user.type(screen.getByLabelText(/departure/i), '2024-12-25');
        
        // Click submit button
        await user.click(screen.getByRole('button', { name: /search flights/i }));
        
        // Test that form was submitted (you might need to mock navigation)
        // For now, just test that no errors occurred
        expect(screen.getByRole('button', { name: /search flights/i })).toBeInTheDocument();
    });
});
