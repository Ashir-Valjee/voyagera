import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { fetchCities } from "../services/cities";

import { searchFlights, createFlightBooking } from "../services/flights";
import FlightCard from "./FlightCard";

export default function FlightResults({
  offers,
  setOffers,
  loading,
  setLoading,
  err,
  setErr,
  paramsKey, // from parent
  lastKey,
  setLastKey,
}) {
  const [params] = useSearchParams();
  const [bookingBusy, setBookingBusy] = useState(false);

  useEffect(() => {
    if (lastKey === paramsKey && offers.length > 0) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const origin = (params.get("origin") || "").toUpperCase();
        const destination = (params.get("destination") || "").toUpperCase();
        const departureDate = params.get("departureDate") || "";
        const returnDate = params.get("returnDate") || undefined;
        const adults = Number(params.get("adults") || 1);
        const nonStop = params.get("nonStop") === "true";

        if (!origin || !destination || !departureDate) {
          if (!cancelled) {
            setOffers([]);
            setLastKey(paramsKey);
            setLoading(false);
          }
          return;
        }

        const res = await searchFlights({
          origin,
          destination,
          departureDate,
          returnDate,
          adults,
          nonStop,
          maxResults: 20,
          currency: "GBP",
        });

        if (!cancelled) {
          setOffers(res);
          setLastKey(paramsKey);
        }
      } catch (e) {
        if (!cancelled) setErr(e.message || "Failed to fetch flights");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [paramsKey]);

  const handleSelect = async (offer) => {
    try {
      setBookingBusy(true);

      const originCityCode = (params.get("origin") || "").toUpperCase();
      const destinationCityCode = (
        params.get("destination") || ""
      ).toUpperCase();
      const passengers = Number(params.get("adults") || 1);

      if (!originCityCode || !destinationCityCode) {
        throw new Error(
          "Missing origin/destination in the URL. Please start a new search."
        );
      }

      const cities = await fetchCities();
      const depCity = cities.find(
        (c) => (c.iataCode || "").toUpperCase() === originCityCode
      );
      const destCity = cities.find(
        (c) => (c.iataCode || "").toUpperCase() === destinationCityCode
      );

      if (!depCity || !destCity) {
        throw new Error(
          "Could not match your city codes to City records. " +
            "Use city IATA codes (e.g., LON not LHR; PAR not CDG) and backfill City.iataCode."
        );
      }

      const durationHours =
        offer.outDurationHours ??
        (offer.outDurationMinutes
          ? Math.round((offer.outDurationMinutes / 60) * 100) / 100
          : 0);

      const result = await createFlightBooking(
        offer.outArrivalAt,
        offer.outDepartureIata,
        depCity.id,
        offer.outDepartureAt,
        offer.outArrivalIata,
        destCity.id,
        String(durationHours),
        passengers,
        offer.outStops ?? 0,
        String(offer.priceTotal)
      );

      if (!result?.success) {
        throw new Error(result?.errors?.join(", ") || "Create booking failed");
      }

      alert("Flight booked!");
    } catch (e) {
      console.error("Booking error:", e);
      console.error("Network error body:", e?.networkError?.result);
      alert(e.message || "Failed to book flight");
    } finally {
      setBookingBusy(false);
    }
  };

  const handleRetry = () => {
    setLastKey(null);
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Flight results</h2>
        <Link to="/flights/search" className="btn btn-ghost btn-sm">
          Change search
        </Link>
      </div>

      {loading && (
        <div className="p-4">
          <span className="loading loading-spinner loading-md" />
        </div>
      )}

      {err && (
        <div className="alert alert-error">
          <div className="flex-1">
            <span>{err}</span>
          </div>
          <button className="btn btn-sm" onClick={handleRetry}>
            Retry
          </button>
        </div>
      )}

      {!loading && !err && offers.length === 0 && (
        <p className="opacity-70">
          No results. Try different dates or airports.
        </p>
      )}

      {!loading && !err && offers.length > 0 && (
        <ul className="list bg-base-100 rounded-box shadow-md">
          <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">
            {offers.length} flight option{offers.length > 1 ? "s" : ""} found
          </li>
          {offers.map((o) => (
            <FlightCard key={o.id} offer={o} onSelect={handleSelect} />
          ))}
        </ul>
      )}

      {bookingBusy && (
        <div className="toast toast-end">
          <div className="alert alert-info">
            <span>Processing your booking…</span>
          </div>
        </div>
      )}
    </section>
  );
}
