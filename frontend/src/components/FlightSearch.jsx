// src/pages/FlightSearchPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCities } from "../services/cities";
import CityAutocomplete from "../components/CityAutocomplete";

export default function FlightSearchPage() {
  const navigate = useNavigate();

  // typed values
  const [originInput, setOriginInput] = useState("");
  const [destinationInput, setDestinationInput] = useState("");

  // resolved IATA codes
  const [originIata, setOriginIata] = useState(null);
  const [destinationIata, setDestinationIata] = useState(null);

  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [adults, setAdults] = useState(1);

  // cities data
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [errors, setErrors] = useState({ origin: "", destination: "" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingCities(true);
      try {
        const list = await fetchCities(); // { city, country, iataCode, countryCode }
        if (!cancelled) setCities(Array.isArray(list) ? list : []);
      } catch {
        if (!cancelled) setCities([]);
      } finally {
        if (!cancelled) setLoadingCities(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // fallback resolution if needed at submit
  const cityIndex = useMemo(() => {
    const byLabel = new Map();
    for (const c of cities) {
      byLabel.set(`${c.city}, ${c.country}`.toLowerCase(), c);
    }
    return { byLabel };
  }, [cities]);

  function resolveOnSubmit(text) {
    const t = (text || "").trim().toLowerCase();
    // try exact "City, Country" first
    const direct = cityIndex.byLabel.get(t);
    if (direct?.iataCode) return direct.iataCode.toUpperCase();

    // try 3-letter code typed
    if (/^[a-z]{3}$/i.test(t)) {
      const code = t.toUpperCase();
      const exists = cities.some(
        (c) => (c.iataCode || "").toUpperCase() === code
      );
      return exists ? code : null;
    }
    return null;
  }

  function onSubmit(e) {
    e.preventDefault();

    const origin = originIata || resolveOnSubmit(originInput);
    const destination = destinationIata || resolveOnSubmit(destinationInput);

    const nextErrors = {
      origin: origin ? "" : "Please pick a city from the list.",
      destination: destination ? "" : "Please pick a city from the list.",
    };
    setErrors(nextErrors);
    if (!origin || !destination) return;

    const params = new URLSearchParams({
      origin,
      destination,
      departureDate,
      ...(returnDate ? { returnDate } : {}),
      adults: String(adults),
      nonStop: "true", // default to non-stop
    });
    navigate(`/results?${params.toString()}`);
  }

  return (
    <section className="max-w-2xl space-y-4 bg-base-100">
      <form onSubmit={onSubmit} className="space-y-4">
        <fieldset className="fieldset">
          <legend className="fieldset-legend">Route</legend>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <CityAutocomplete
              id="origin-city"
              label="Origin"
              value={originInput}
              onChange={setOriginInput}
              cities={cities}
              onResolved={(code) => setOriginIata(code)}
              error={errors.origin}
              required
            />
            <CityAutocomplete
              id="destination-city"
              label="Destination"
              value={destinationInput}
              onChange={setDestinationInput}
              cities={cities}
              onResolved={(code) => setDestinationIata(code)}
              error={errors.destination}
              required
            />
          </div>

          {loadingCities && (
            <p className="text-xs opacity-70 mt-1">Loading cities…</p>
          )}
        </fieldset>

        <fieldset className="fieldset">
          <legend className="fieldset-legend">Dates</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="date"
              className="input w-full"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              required
            />
            <input
              type="date"
              className="input w-full"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              placeholder="(optional)"
            />
          </div>
        </fieldset>

        <fieldset className="fieldset">
          <legend className="fieldset-legend">Passengers</legend>
          <input
            type="number"
            className="input w-full md:w-40"
            min={1}
            max={9}
            value={adults}
            onChange={(e) => setAdults(Number(e.target.value || 1))}
            required
          />
        </fieldset>

        <button className="btn btn-primary">Search</button>
      </form>
    </section>
  );
}
