import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchCities } from "../services/cities";
import { fetchTicketmasterEvents } from "../services/activity_booking";
import ActivityCard from "./ActivityCard";
import {
  dayStartZ,
  dayEndZ,
  addDaysYMD,
  resolveCityName,
} from "../utils/helpers";

export default function Activities() {
  const [params] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [events, setEvents] = useState([]);
  const [classification, setClassification] = useState("");

  const destinationParam = (params.get("destination") || "").trim();
  const departureDate = params.get("departureDate") || "";
  const returnDate = params.get("returnDate") || "";

  const { startIso, endIso } = useMemo(() => {
    if (departureDate && returnDate) {
      return {
        startIso: dayStartZ(departureDate),
        endIso: dayEndZ(returnDate),
      };
    }
    if (departureDate && !returnDate) {
      const endYMD = addDaysYMD(departureDate, 3);
      return { startIso: dayStartZ(departureDate), endIso: dayEndZ(endYMD) };
    }
    return { startIso: null, endIso: null };
  }, [departureDate, returnDate]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setErr(null);
      setEvents([]);

      try {
        if (!destinationParam || !startIso || !endIso) {
          setLoading(false);
          return;
        }

        // Load Cities and resolve a full city name to send to Ticketmaster
        const cities = await fetchCities(); // must include { city, iataCode }
        const cityName = resolveCityName(destinationParam, cities);
        if (!cityName) {
          throw new Error(
            `Could not resolve city name from "${destinationParam}". ` +
              `Please use a known city or seed your Cities table.`
          );
        }

        const results = await fetchTicketmasterEvents({
          city: cityName, // <-- ALWAYS a full city name like "London"
          startDateTime: startIso,
          endDateTime: endIso,
          classificationName: classification || undefined,
          size: 24,
        });

        if (!cancelled) setEvents(results);
      } catch (e) {
        if (!cancelled) {
          console.error(e);
          setErr(e.message || "Failed to fetch activities");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [destinationParam, startIso, endIso, classification]);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-semibold">Activities</h2>

        <div className="flex items-center gap-2">
          <label className="label-text text-sm">Category:</label>
          <select
            className="select select-sm select-bordered"
            value={classification}
            onChange={(e) => setClassification(e.target.value)}
          >
            <option value="">All</option>
            <option value="Music">Music</option>
            <option value="Sports">Sports</option>
            <option value="Arts & Theatre">Arts & Theatre</option>
            <option value="Film">Film</option>
            <option value="Family">Family</option>
          </select>
        </div>
      </div>

      {!destinationParam && (
        <div className="alert">
          <span>Enter a destination to see activities.</span>
        </div>
      )}

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

      {!loading && !err && events.length === 0 && destinationParam && (
        <p className="opacity-70">No activities found for your dates.</p>
      )}

      {!loading && !err && events.length > 0 && (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((ev) => (
            <ActivityCard key={ev.id} ev={ev} />
          ))}
        </ul>
      )}
    </section>
  );
}
