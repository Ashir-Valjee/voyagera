import { useState } from "react";
import FlightResults from "../components/FlightResults";
import Activities from "../components/Activities";

export default function ResultsPage() {
  const [tab, setTab] = useState("flights"); // "flights" | "activities"

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

      {tab === "flights" ? <FlightResults /> : <Activities />}
    </section>
  );
}
