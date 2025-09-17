// frontend/src/services/eligibility.js
import { fetchFlightBookings } from "./flights";

/**
 * Returns true iff the user has a flight booking with:
 * - departureCity.iataCode === origin
 * - destinationCity.iataCode === destination
 * - departureDateTime (date part) === departureDate
 * - if returnDate provided, arrivalDateTime (date part) === returnDate
 */
export async function hasMatchingFlightBookingForSearch({
  origin,
  destination,
  departureDate,
  returnDate, // optional
}) {
  try {
    const bookings = (await fetchFlightBookings()) || [];
    const o = (origin || "").toUpperCase();
    const d = (destination || "").toUpperCase();
    const depYMD = (departureDate || "").trim();
    const retYMD = (returnDate || "").trim();

    return bookings.some((b) => {
      const depCity = (b?.departureCity?.iataCode || "").toUpperCase();
      const destCity = (b?.destinationCity?.iataCode || "").toUpperCase();
      const depDateY = (b?.departureDateTime || "").slice(0, 10);
      const arrDateY = (b?.arrivalDateTime || "").slice(0, 10);

      const citiesMatch = depCity === o && destCity === d;
      const datesMatch = retYMD
        ? depDateY === depYMD && arrDateY === retYMD
        : depDateY === depYMD;

      return citiesMatch && datesMatch;
    });
  } catch {
    // If not logged in or error fetching bookings, treat as no match
    return false;
  }
}
