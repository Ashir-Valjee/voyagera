import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { searchFlights, createFlightBooking } from "../services/flights";
import { fetchCities } from "../services/cities";
import FlightCard from "./FlightCard";
import EditFlightSearch from "./EditFlightSearch";
import { computeMinutesBetween } from "../utils/helpers";

export default function FlightResults({
  offers,
  setOffers,
  loading,
  setLoading,
  err,
  setErr,
  paramsKey,
  lastKey,
  setLastKey,
}) {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [showSearch, setShowSearch] = useState(false);
  const [bookingBusyId, setBookingBusyId] = useState(null);

  const toggleSearch = () => setShowSearch((s) => !s);

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
        const ns = true;

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
  }, [paramsKey]);

  function minutesToHoursStr(mins) {
    if (!mins && mins !== 0) return "0";
    const hours = Math.round((mins / 60) * 100) / 100;
    return String(hours);
  }

  async function handleSelect(offer) {
    try {
      setBookingBusyId(offer.id);

      const originParam = (params.get("origin") || "").toUpperCase();
      const destParam = (params.get("destination") || "").toUpperCase();
      const adultsParam = Number(params.get("adults") || 1);

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

      const outMins =
        offer.outDurationMinutes ??
        computeMinutesBetween(offer.outDepartureAt, offer.outArrivalAt);
      const durationHoursStr = minutesToHoursStr(outMins || 0);

      const result = await createFlightBooking(
        offer.outArrivalAt,
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
  const passengers = Number(params.get("adults") || 1);
  // Called by EditFlightSearch when user submits changes
  function handleApplySearch({
    origin,
    destination,
    departureDate,
    returnDate,
    adults,
  }) {
    const q = new URLSearchParams({
      origin,
      destination,
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
        <EditFlightSearch
          initialOrigin={params.get("origin") || ""}
          initialDestination={params.get("destination") || ""}
          initialDepartureDate={params.get("departureDate") || ""}
          initialReturnDate={params.get("returnDate") || ""}
          initialAdults={Number(params.get("adults") || 1)}
          onApply={({
            origin,
            destination,
            departureDate,
            returnDate,
            adults,
          }) => {
            const q = new URLSearchParams({
              origin,
              destination,
              departureDate,
              adults: String(Math.max(1, adults)),
              nonStop: "true",
            });
            if (returnDate) q.set("returnDate", returnDate);
            navigate(`/results?${q.toString()}`);
            setShowSearch(false);
            setLastKey(null);
          }}
          onCancel={() => setShowSearch(false)}
        />
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
              passengers={passengers}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
