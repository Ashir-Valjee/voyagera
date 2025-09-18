import { useEffect, useMemo, useState } from "react";
import CityAutocomplete from "../components/CityAutocomplete";
import { fetchCities } from "../services/cities";

export default function EditFlightSearch({
  initialOrigin = "",
  initialDestination = "",
  initialDepartureDate = "",
  initialReturnDate = "",
  initialAdults = 1,
  onApply,
  onCancel,
}) {
  const [originInput, setOriginInput] = useState(initialOrigin);
  const [destinationInput, setDestinationInput] = useState(initialDestination);

  const [originIata, setOriginIata] = useState(null);
  const [destinationIata, setDestinationIata] = useState(null);

  const [departureDate, setDepartureDate] = useState(initialDepartureDate);
  const [returnDate, setReturnDate] = useState(initialReturnDate);
  const [adults, setAdults] = useState(initialAdults);

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

  useEffect(() => {
    setOriginInput(initialOrigin);
    setDestinationInput(initialDestination);
    setDepartureDate(initialDepartureDate);
    setReturnDate(initialReturnDate);
    setAdults(initialAdults);
    setOriginIata(null);
    setDestinationIata(null);
    setErrors({ origin: "", destination: "" });
  }, [
    initialOrigin,
    initialDestination,
    initialDepartureDate,
    initialReturnDate,
    initialAdults,
  ]);

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
    if (!origin || !destination || !departureDate) return;

    onApply?.({
      origin,
      destination,
      departureDate,
      returnDate: returnDate || "",
      adults: Math.max(1, Number(adults || 1)),
    });
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

  function swapRoute() {
    setOriginInput(() => {
      const next = destinationInput;
      return next;
    });
    setDestinationInput(() => {
      const next = originInput;
      return next;
    });
    setOriginIata((prev) => {
      const next = destinationIata;
      setDestinationIata(prev);
      return next;
    });
  }

  return (
    <section className="w-full   p-6 sm:p-8 rounded-xl shadow-lg">
      <form onSubmit={onSubmit} className="mt-2 space-y-2">
        <fieldset className="fieldset">
          <legend className="fieldset-legend mb-1 text-base font-medium  ">
            Route
          </legend>

          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="relative">
              <CityAutocomplete
                id="origin-city-edit"
                label="Origin"
                value={originInput}
                onChange={setOriginInput}
                cities={cities}
                onResolved={(code) => setOriginIata(code)}
                error={errors.origin}
                required
                inputClassName="pl-10"
              />
            </div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block">
              <button
                type="button"
                onClick={swapRoute}
                className="p-2 rounded-full  hover: transition-colors"
                title="Swap origin/destination"
              >
                <SwapIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-gray-500 dark:text-white">🛬</span>
              </div>
              <CityAutocomplete
                id="destination-city-edit"
                label="Destination"
                value={destinationInput}
                onChange={setDestinationInput}
                cities={cities}
                onResolved={(code) => setDestinationIata(code)}
                error={errors.destination}
                required
                inputClassName="pl-10"
              />
            </div>
          </div>

          {loadingCities && <p className="text-xs  mt-1">Loading cities…</p>}
        </fieldset>

        <fieldset className="fieldset">
          <legend className="fieldset-legend mb-1 text-base font-medium ">
            Dates
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label
                htmlFor="departure-date-edit"
                className="mb-1 text-sm font-medium "
              >
                Departure
              </label>
              <div className="relative">
                <input
                  id="departure-date-edit"
                  type="date"
                  className="input pl-10 w-full "
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="return-date-edit"
                className="mb-1 text-sm font-medium "
              >
                Return
              </label>
              <div className="relative">
                <input
                  id="return-date-edit"
                  type="date"
                  className="input pl-10 w-full "
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                />
              </div>
            </div>
          </div>
        </fieldset>

        <fieldset className="fieldset">
          <legend className="fieldset-legend mb-1 text-base font-medium text-gray-900 dark:text-white">
            Passengers
          </legend>
          <div className="max-w-xs">
            <div className="flex flex-col">
              <label
                htmlFor="passengers-edit"
                className="mb-1 text-sm font-medium text-gray-700 dark:text-white"
              >
                Adults
              </label>
              <div className="relative">
                <input
                  id="passengers-edit"
                  type="number"
                  className="input pl-10 w-full text-gray-400"
                  min={1}
                  max={9}
                  value={adults}
                  onChange={(e) => setAdults(Number(e.target.value || 1))}
                  required
                />
              </div>
            </div>
          </div>
        </fieldset>

        <div className="pt-4 flex gap-2 justify-center sm:justify-start">
          <button className="btn btn-primary w-full sm:w-auto" type="submit">
            Apply
          </button>
          <button
            type="button"
            className="btn btn-ghost w-full sm:w-auto"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
