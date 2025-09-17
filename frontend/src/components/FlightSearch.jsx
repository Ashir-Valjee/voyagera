import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCities } from "../services/cities";

export default function FlightSearchPage() {
  const navigate = useNavigate();

  // typed inputs (can be IATA or full city, e.g. "London" or "London, United Kingdom")
  const [originInput, setOriginInput] = useState("");
  const [destinationInput, setDestinationInput] = useState("");

  // resolved IATA codes (derived as user types/chooses a suggestion)
  const [originIata, setOriginIata] = useState("");
  const [destinationIata, setDestinationIata] = useState("");

  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [adults, setAdults] = useState(1);

  // data + UI state
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [errors, setErrors] = useState({ origin: "", destination: "" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingCities(true);
      try {
        const list = await fetchCities(); // must return {city, country, iataCode, countryCode}
        if (!cancelled) setCities(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error(e);
        if (!cancelled) setCities([]);
      } finally {
        if (!cancelled) setLoadingCities(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const cityOptions = useMemo(() => {
    // labels used in the <datalist> suggestions
    return cities
      .map((c) => ({
        ...c,
        label: `${c.city}, ${c.country}${c.iataCode ? ` (${c.iataCode})` : ""}`,
      }))
      .sort((a, b) => a.city.localeCompare(b.city));
  }, [cities]);

  function norm(s) {
    return (s || "").trim().toLowerCase();
  }

  function looksLikeIata(s) {
    return /^[A-Za-z]{3}$/.test((s || "").trim());
  }

  function resolveToIata(input) {
    const raw = (input || "").trim();

    // If user typed an IATA already, validate it exists in our table
    if (looksLikeIata(raw)) {
      const code = raw.toUpperCase();
      const exists = cities.some(
        (c) => (c.iataCode || "").toUpperCase() === code
      );
      return exists ? code : null;
    }

    // Parse forms like "City", "City, Country"
    const m = raw.match(/^([^,()]+?)(?:\s*,\s*([^()]+))?$/);
    const cityPart = norm(m?.[1] || raw);
    const countryPart = norm(m?.[2] || "");

    let matches = cities.filter((c) => norm(c.city) === cityPart);
    if (countryPart) {
      matches = matches.filter((c) => norm(c.country) === countryPart);
    }

    // prefer a match that actually has an iataCode
    const withCode = matches.find((c) => !!c.iataCode);
    if (withCode) return withCode.iataCode.toUpperCase();

    // if multiple without iata, we consider it invalid (we need real IATA for search)
    return null;
  }

  // live-resolve to IATA as the user types / chooses
  function onOriginChange(v) {
    setOriginInput(v);
    setErrors((e) => ({ ...e, origin: "" }));
    const code = resolveToIata(v);
    setOriginIata(code || "");
  }
  function onDestinationChange(v) {
    setDestinationInput(v);
    setErrors((e) => ({ ...e, destination: "" }));
    const code = resolveToIata(v);
    setDestinationIata(code || "");
  }

  function onSubmit(e) {
    e.preventDefault();
    const origin = originIata || resolveToIata(originInput);
    const destination = destinationIata || resolveToIata(destinationInput);

    const nextErrors = {
      origin: origin ? "" : "Please choose a valid city from suggestions.",
      destination: destination
        ? ""
        : "Please choose a valid city from suggestions.",
    };
    setErrors(nextErrors);

    if (!origin || !destination) return;

    const params = new URLSearchParams({
      origin,
      destination,
      departureDate,
      ...(returnDate ? { returnDate } : {}),
      adults: String(adults),
      // Always default to non-stop
      nonStop: "true",
    });

    navigate(`/results?${params.toString()}`);
  }

  // Helper to show a small status next to fields
  function ValidityBadge({ ok }) {
    if (!originInput && !destinationInput) return null;
    return ok ? (
      <span className="badge badge-success badge-sm">OK</span>
    ) : (
      <span className="badge badge-ghost badge-sm">Pick from list</span>
    );
  }

  return (
    <section className="max-w-2xl space-y-4 bg-base-100">
      <form onSubmit={onSubmit} className="space-y-4">
        <fieldset className="fieldset">
          <legend className="fieldset-legend">Route</legend>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="label">
                <span className="label-text">Origin</span>
                <ValidityBadge ok={!!originIata} />
              </label>
              <input
                className={`input w-full ${errors.origin ? "input-error" : ""}`}
                placeholder="Type city or IATA (e.g. London or LON)"
                list="cities-datalist"
                value={originInput}
                onChange={(e) => onOriginChange(e.target.value)}
                onBlur={(e) => onOriginChange(e.target.value)}
                autoComplete="off"
                required
              />
              {errors.origin && (
                <p className="text-error text-xs mt-1">{errors.origin}</p>
              )}
            </div>

            <div>
              <label className="label">
                <span className="label-text">Destination</span>
                <ValidityBadge ok={!!destinationIata} />
              </label>
              <input
                className={`input w-full ${
                  errors.destination ? "input-error" : ""
                }`}
                placeholder="Type city or IATA (e.g. Paris or PAR)"
                list="cities-datalist"
                value={destinationInput}
                onChange={(e) => onDestinationChange(e.target.value)}
                onBlur={(e) => onDestinationChange(e.target.value)}
                autoComplete="off"
                required
              />
              {errors.destination && (
                <p className="text-error text-xs mt-1">{errors.destination}</p>
              )}
            </div>
          </div>

          {/* Shared datalist for suggestions */}
          <datalist id="cities-datalist">
            {loadingCities ? (
              <option value="Loading cities…" />
            ) : (
              cityOptions.map((c) => (
                <option
                  key={`${c.country}-${c.city}`}
                  value={`${c.city}, ${c.country}`}
                >
                  {c.iataCode ? ` (${c.iataCode})` : ""}
                </option>
              ))
            )}
          </datalist>

          <p className="text-xs opacity-70 mt-2">
            Choose a city from the suggestions. We’ll use its IATA code
            automatically.
          </p>
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

        {/* Non-stop option removed; defaulted to true in params */}

        <button className="btn btn-primary">Search</button>
      </form>
    </section>
  );
}
