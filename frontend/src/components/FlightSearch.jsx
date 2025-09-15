import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function FlightSearchPage() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [nonStop, setNonStop] = useState(false);

  const navigate = useNavigate();

  function onSubmit(e) {
    e.preventDefault();

    const params = new URLSearchParams({
      origin: origin.trim().toUpperCase(),
      destination: destination.trim().toUpperCase(),
      departureDate,
      ...(returnDate ? { returnDate } : {}),
      adults: String(adults),
      nonStop: String(nonStop),
    });
    navigate(`/results?${params.toString()}`);
  }

  return (
    <section className="max-w-2xl space-y-4 bg-base-100">
      <form onSubmit={onSubmit} className="space-y-4">
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
            />
            <input
              type="date"
              className="input"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
            />
          </div>
        </fieldset>

        <div className="grid grid-cols-2 gap-3">
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Passengers</legend>
            <input
              type="number"
              className="input"
              min={1}
              max={9}
              value={adults}
              onChange={(e) => setAdults(Number(e.target.value))}
            />
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">Options</legend>
            <label className="label cursor-pointer">
              <span>Non-stop only</span>
              <input
                type="checkbox"
                className="toggle"
                checked={nonStop}
                onChange={(e) => setNonStop(e.target.checked)}
              />
            </label>
          </fieldset>
        </div>

        <button className="btn btn-primary">Search</button>
      </form>
    </section>
  );
}
