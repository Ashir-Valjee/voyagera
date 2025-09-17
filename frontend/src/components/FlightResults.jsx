// src/components/FlightResults.jsx
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { searchFlights, createFlightBooking } from "../services/flights";
import { fetchCities } from "../services/cities";
import FlightCard from "./FlightCard";
import { computeMinutesBetween } from "../utils/helpers";

export default function FlightResults({
  offers,
  setOffers,
  loading,
  setLoading,
  err,
  setErr,
  paramsKey, // from parent ResultsPage
  lastKey,
  setLastKey,
}) {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  // Inline "Change search" form visibility + fields (no nonStop here)
  const [showSearch, setShowSearch] = useState(false);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [adults, setAdults] = useState(1);

  // per-row booking spinner (optional hook-up to card if you add a busy prop)
  const [bookingBusyId, setBookingBusyId] = useState(null);

  function loadFormFromParams() {
    setOrigin((params.get("origin") || "").toUpperCase());
    setDestination((params.get("destination") || "").toUpperCase());
    setDepartureDate(params.get("departureDate") || "");
    setReturnDate(params.get("returnDate") || "");
    setAdults(Number(params.get("adults") || 1));
  }

  const toggleSearch = () => {
    if (!showSearch) loadFormFromParams();
    setShowSearch((s) => !s);
  };

  // Fetch on URL query change (nonStop is forced to true)
  useEffect(() => {
    if (lastKey === paramsKey && offers.length > 0) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const o = (params.get("origin") || "").toUpperCase();
        const d = (params.get("destination") || "").toUpperCase();
        const dep = params.get("departureDate") || "";
        const ret = params.get("returnDate") || undefined;
        const a = Number(params.get("adults") || 1);
        const ns = true; // default non-stop

        if (!o || !d || !dep) {
          if (!cancelled) {
            setOffers([]);
            setLastKey(paramsKey);
            setLoading(false);
          }
          return;
        }

        const res = await searchFlights({
          origin: o,
          destination: d,
          departureDate: dep,
          returnDate: ret,
          adults: a,
          nonStop: ns,
          maxResults: 20,
          currency: "GBP",
        });

        if (!cancelled) {
          setOffers(res || []);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  // ---- BOOKING ----
  function minutesToHoursStr(mins) {
    if (!mins && mins !== 0) return "0";
    const hours = Math.round((mins / 60) * 100) / 100;
    return String(hours); // e.g. "6.5" or "2.75"
  }

  async function handleSelect(offer) {
    try {
      setBookingBusyId(offer.id);

      // URL params
      const originParam = (params.get("origin") || "").toUpperCase();
      const destParam = (params.get("destination") || "").toUpperCase();
      const adultsParam = Number(params.get("adults") || 1);

      // Map params -> City rows using iata_code
      const cities = await fetchCities();
      const byIata = (code) =>
        cities.find(
          (c) => (c.iataCode || "").toUpperCase() === (code || "").toUpperCase()
        );

      const originCity = byIata(originParam);
      const destCity = byIata(destParam);

      if (!originCity || !destCity) {
        throw new Error(
          "Couldn’t map origin/destination to Cities. Check your City seeds and iata_code values (use city codes like LON/PAR, not LHR/CDG)."
        );
      }

      // Use OUTBOUND duration only (matches your working version)
      const outMins =
        offer.outDurationMinutes ??
        computeMinutesBetween(offer.outDepartureAt, offer.outArrivalAt);
      const durationHoursStr = minutesToHoursStr(outMins || 0);

      // IMPORTANT: call your service with the original positional signature
      const result = await createFlightBooking(
        offer.outArrivalAt, // arrivalDateTime
        offer.outDepartureIata, // departureAirport (IATA)
        originCity.id, // departureCityId
        offer.outDepartureAt, // departureDateTime
        offer.outArrivalIata, // destinationAirport (IATA)
        destCity.id, // destinationCityId
        durationHoursStr, // flightDuration (Decimal as string)
        adultsParam, // numberOfPassengers
        offer.outStops ?? 0, // numberOfStops
        String(offer.priceTotal ?? "0") // totalPrice (Decimal as string)
      );

      if (!result?.success) {
        throw new Error(result?.errors?.join(", ") || "Booking failed");
      }

      alert("Flight booked!");
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to book flight");
    } finally {
      setBookingBusyId(null);
    }
  }

  const handleRetry = () => setLastKey(null);

  // Submit updated search → updates URL (nonStop always "true")
  function onSubmit(e) {
    e.preventDefault();
    if (!origin || !destination || !departureDate) return;

    const q = new URLSearchParams({
      origin: origin.trim().toUpperCase(),
      destination: destination.trim().toUpperCase(),
      departureDate,
      adults: String(Math.max(1, adults)),
      nonStop: "true",
    });
    if (returnDate) q.set("returnDate", returnDate);

    navigate(`/results?${q.toString()}`);
    setShowSearch(false);
    setLastKey(null);
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Flight results</h2>
        <button className="btn btn-ghost btn-sm" onClick={toggleSearch}>
          {showSearch ? "Close" : "Change search"}
        </button>
      </div>

      {showSearch && (
        <form
          onSubmit={onSubmit}
          className="space-y-3 p-4 rounded-box bg-base-100 shadow"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Route</legend>
              <div className="grid grid-cols-2 gap-3">
                <input
                  className="input"
                  placeholder="Origin (IATA)"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value.toUpperCase())}
                  maxLength={3}
                />
                <input
                  className="input"
                  placeholder="Destination (IATA)"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value.toUpperCase())}
                  maxLength={3}
                />
              </div>
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">Dates</legend>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  className="input"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  required
                />
                <input
                  type="date"
                  className="input"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                />
              </div>
            </fieldset>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Passengers</legend>
              <input
                type="number"
                className="input"
                min={1}
                max={9}
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value || 1))}
              />
            </fieldset>
            {/* Non-stop option removed; default enforced */}
          </div>

          <div className="flex items-center gap-2">
            <button className="btn btn-primary btn-sm" type="submit">
              Apply
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setShowSearch(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

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
            <FlightCard
              key={o.id}
              offer={o}
              onSelect={handleSelect}
              // If you add busy visuals inside FlightCard, pass this:
              // busy={bookingBusyId === o.id}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
