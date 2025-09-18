import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import FlightResults from "../components/FlightResults";
import Activities from "../components/Activities";

export default function ResultsPage() {
  const [tab, setTab] = useState("flights");
  const [params] = useSearchParams();

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const [lastKey, setLastKey] = useState(null);

  const paramsKey = params.toString();

  return (
    <section className="max-w-5xl mx-auto space-y-6">
      <div
        role="tablist"
        className="tabs tabs-bordered flex flex-row justify-center"
      >
        <button
          role="tab"
          className={`tab ${tab === "flights" ? "tab-active" : ""}`}
          onClick={() => setTab("flights")}
        >
          <h2 className="text-2xl">Flights</h2>
        </button>
        <button
          role="tab"
          className={`tab ${tab === "activities" ? "tab-active" : ""}`}
          onClick={() => setTab("activities")}
        >
          <h2 className="text-2xl">Activities</h2>
        </button>
      </div>

      {tab === "flights" ? (
        <FlightResults
          offers={offers}
          setOffers={setOffers}
          loading={loading}
          setLoading={setLoading}
          err={err}
          setErr={setErr}
          paramsKey={paramsKey}
          lastKey={lastKey}
          setLastKey={setLastKey}
        />
      ) : (
        <Activities />
      )}
    </section>
  );
}
