import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCities } from "../services/cities";
import CityAutocomplete from "../components/CityAutocomplete";

export default function FlightSearchPage() {
  const navigate = useNavigate();

  const [originInput, setOriginInput] = useState("");
  const [destinationInput, setDestinationInput] = useState("");

  const [originIata, setOriginIata] = useState(null);
  const [destinationIata, setDestinationIata] = useState(null);

  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [adults, setAdults] = useState(1);

  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [errors, setErrors] = useState({ origin: "", destination: "" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingCities(true);
      try {
        const list = await fetchCities();
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

  const cityIndex = useMemo(() => {
    const byLabel = new Map();
    for (const c of cities) {
      byLabel.set(`${c.city}, ${c.country}`.toLowerCase(), c);
    }
    return { byLabel };
  }, [cities]);

  function resolveOnSubmit(text) {
    const t = (text || "").trim().toLowerCase();

    const direct = cityIndex.byLabel.get(t);
    if (direct?.iataCode) return direct.iataCode.toUpperCase();

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

  const SwapIcon = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        {...props}
    >
        <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
        />
    </svg>
    );

  return (
      <section className="w-full max-w-5xl bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-xl">

        <form onSubmit={onSubmit} className="mt-8 space-y-2">
          <fieldset className="fieldset p-0">
            <legend className="fieldset-legend mb-0 text-base font-medium text-gray-900 dark:text-white">Route</legend>
            <div className="relative grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-18 items-center">
              <div className="relative">
                <CityAutocomplete 
                id="origin-city" 
                label="Origin" 
                value={originInput} 
                onChange={setOriginInput} 
                cities={cities} 
                onResolved={(code) => setOriginIata(code)} 
                error={errors.origin} 
                required 
                inputClassName="pl-10" />
              </div>

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/4 hidden md:block">
                  <button  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
                      <SwapIcon className="w-5 h-5" />
                  </button>
              </div>

              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 dark:text-white">🛬</span>
                  </div>
                <CityAutocomplete 
                id="destination-city" 
                label="Destination" 
                value={destinationInput} 
                onChange={setDestinationInput} 
                cities={cities} 
                onResolved={(code) => setDestinationIata(code)} 
                error={errors.destination} 
                required 
                inputClassName="pl-10" />
              </div>
            </div>
            {loadingCities && (
              <p className="text-xs text-gray-500 dark:text-white mt-1">Loading cities…</p>
            )}
          </fieldset>

          <fieldset className="fieldset p-0">
            <legend className="fieldset-legend mb-1 text-base font-medium text-gray-900 dark:text-white">Dates</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label htmlFor="departure-date" className="mb-1 text-sm font-medium text-gray-700 dark:text-white">Departure</label>
                  <div className="relative">
                    <input 
                    id="departure-date" 
                    type="date" 
                    className="input pl-10 w-full text-gray-400" 
                    value={departureDate} 
                    onChange={(e) => setDepartureDate(e.target.value)} 
                    required />
                  </div>
                </div>
                <div className="flex flex-col">
                  <label htmlFor="return-date" className="mb-1 text-sm font-medium text-gray-700 dark:text-white">Return</label>
                  <div className="relative">
                    <input 
                    id="return-date" 
                    type="date" 
                    className="input pl-10 w-full text-gray-400" 
                    value={returnDate} 
                    onChange={(e) => setReturnDate(e.target.value)} />
                  </div>
                </div>
            </div>
          </fieldset>
          
          
          <fieldset className="fieldset p-0">
            <legend className="fieldset-legend mb-1 text-base font-medium text-gray-900 dark:text-white">Passengers</legend>
            <div className="max-w-xs">
                <div className="flex flex-col">
                  <label htmlFor="passengers" className="mb-1 text-sm font-medium text-gray-700 dark:text-white">Adults</label>
                  <div className="relative">
                    <input 
                    id="passengers" 
                    type="number" 
                    className="input pl-10 w-full text-gray-400" 
                    min={1} 
                    max={9} 
                    value={adults} 
                    onChange={(e) => setAdults(Number(e.target.value || 1))} required 
                    />
                  </div>
                </div>
            </div>
          </fieldset>
          
          <div className="pt-4 flex justify-center">
            <button className="btn btn-primary w-full sm:w-auto">
              Search Flights
            </button>
          </div>
        </form>
      </section>
  );
}

