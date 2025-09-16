import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchCities } from "../services/cities";
import {
  fetchTicketmasterEvents,
  createActivityBooking,
} from "../services/activity_booking";
import { fetchFlightBookings } from "../services/flights";
import ActivityCard from "./ActivityCard";
import {
  dayStartZ,
  dayEndZ,
  addDaysYMD,
  resolveCityName,
  normalizeCategory,
  toTicketmasterFilter,
  ensureDateTimeZ,
} from "../utils/helpers";

export default function Activities() {
  const [params] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [events, setEvents] = useState([]);
  const [classification, setClassification] = useState("");

  const [cities, setCities] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [busyId, setBusyId] = useState(null);

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

        const [citiesList, userBookings] = await Promise.all([
          fetchCities(),
          fetchFlightBookings().catch(() => []),
        ]);
        if (cancelled) return;
        setCities(citiesList);
        setBookings(Array.isArray(userBookings) ? userBookings : []);

        const cityName = resolveCityName(destinationParam, citiesList);
        if (!cityName) {
          throw new Error(
            `Could not resolve city name from "${destinationParam}". Please seed your Cities table.`
          );
        }

        const tmFilter = toTicketmasterFilter(classification);
        const results = await fetchTicketmasterEvents({
          city: cityName,
          startDateTime: startIso,
          endDateTime: endIso,
          classificationName: tmFilter, // "Arts & Theatre" for Arts, etc.
          size: 24,
        });

        // Add our normalized category to each event for UI + booking
        const normalized = (results || []).map((ev) => ({
          ...ev,
          uiCategory: normalizeCategory(ev?.classificationName),
        }));

        if (!cancelled) setEvents(normalized);
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

  async function handleBook(ev) {
    try {
      setBusyId(ev.id);

      const cityRec =
        cities.find(
          (c) => (c.city || "").toLowerCase() === (ev.city || "").toLowerCase()
        ) ||
        cities.find(
          (c) =>
            (c.city || "").toLowerCase() ===
            resolveCityName(destinationParam, cities).toLowerCase()
        );
      if (!cityRec)
        throw new Error("Couldn't map event city to a City record.");

      //  pick a flight booking to associate (most recent)
      if (!bookings?.length) {
        throw new Error("No flight booking found. Please book a flight first.");
      }
      const chosen = [...bookings].sort(
        (a, b) =>
          new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
      )[0];

      // 3) create the activity booking with UPPERCASE category
      const categoryUpper = (ev.uiCategory || "Family").toUpperCase();

      const res = await createActivityBooking(
        ensureDateTimeZ(ev.startDateTime),
        cityRec.id,
        1,
        categoryUpper,
        ev.name,
        ev.eventUrl,
        "0.00",
        chosen.id,
        ev.imageUrl || ""
      );

      if (!res?.success) {
        throw new Error(res?.errors?.join(", ") || "Booking failed");
      }

      alert("Activity booked to your trip!");
    } catch (e) {
      console.error(e);
      alert(e.message || "Failed to book activity");
    } finally {
      setBusyId(null);
    }
  }

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
            <option value="Arts">Arts</option>
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
            <ActivityCard
              key={ev.id}
              ev={ev}
              onBook={handleBook}
              busy={busyId === ev.id}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
