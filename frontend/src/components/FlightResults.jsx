import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { searchFlights } from "../services/flights";
import FlightCard from "./FlightCard";

export default function FlightResults() {
  const [params] = useSearchParams();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const origin = params.get("origin");
        const destination = params.get("destination");
        const departureDate = params.get("departureDate");
        const returnDate = params.get("returnDate") || undefined;
        const adults = Number(params.get("adults") || 1);
        const nonStop = params.get("nonStop") === "true";

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
        setOffers(res);
      } catch (e) {
        setErr(e.message || "Failed to fetch flights");
      } finally {
        setLoading(false);
      }
    })();
  }, [params]);

  function handleSelect(offer) {
    // TODO: hook up your createFlightBooking mutation here
    console.log("Selected:", offer);
  }

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
          <span>{err}</span>
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
