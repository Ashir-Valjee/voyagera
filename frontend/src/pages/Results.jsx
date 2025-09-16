import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import FlightResults from "../components/FlightResults";
import Activities from "../components/Activities";

export default function ResultsPage() {
  const [tab, setTab] = useState("flights");
  const [params] = useSearchParams();

  // lifted state
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // track the last params key for which we fetched
  const [lastKey, setLastKey] = useState(null);

  // stable key that changes only when URL query changes
  const paramsKey = params.toString();

  return (
    <section className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Results</h1>

      <div role="tablist" className="tabs tabs-bordered">
        <button
          role="tab"
          className={`tab ${tab === "flights" ? "tab-active" : ""}`}
          onClick={() => setTab("flights")}
        >
          Flights
        </button>
        <button
          role="tab"
          className={`tab ${tab === "activities" ? "tab-active" : ""}`}
          onClick={() => setTab("activities")}
        >
          Activities
        </button>
      </div>

      {tab === "flights" ? (
        <FlightResults
          // lifted state
          offers={offers}
          setOffers={setOffers}
          loading={loading}
          setLoading={setLoading}
          err={err}
          setErr={setErr}
          // keys to control refetching
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
