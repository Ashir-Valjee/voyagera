// src/components/FlightResults.jsx
import { useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { searchFlights } from "../services/flights";
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

  useEffect(() => {
    // if we already fetched for this query string, don't fetch again
    if (lastKey === paramsKey && offers.length > 0) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const origin = params.get("origin") || "";
        const destination = params.get("destination") || "";
        const departureDate = params.get("departureDate") || "";
        const returnDate = params.get("returnDate") || undefined;
        const adults = Number(params.get("adults") || 1);
        const nonStop = params.get("nonStop") === "true";

        // (optional) skip if required fields missing
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
  }, [paramsKey]); // only re-run when the URL query actually changes

  const handleSelect = (offer) => {
    // TODO: call your createFlightBooking mutation
    console.log("Selected:", offer);
  };

  const handleRetry = () => {
    // force a refetch by clearing lastKey so the effect runs again
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
    </section>
  );
}
