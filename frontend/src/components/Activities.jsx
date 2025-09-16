// src/components/Activities.jsx
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchCities } from "../services/cities";
import {
  fetchTicketmasterEvents,
  createActivityBooking, // NEW
} from "../services/activity_booking";
import { fetchFlightBookings } from "../services/flights"; // NEW
import ActivityCard from "./ActivityCard";
import {
  dayStartZ,
  dayEndZ,
  addDaysYMD,
  resolveCityName,
} from "../utils/helpers";

// local tiny helper: ensure a DateTime string for our mutation
function ensureDateTimeZ(s) {
  if (!s) return null;
  // if it's only a date like "2025-09-17", set noon UTC
  if (!s.includes("T")) return `${s}T12:00:00Z`;
  // if it has time but no Z, assume UTC and add Z
  return s.endsWith("Z") ? s : `${s}Z`;
}

export default function Activities() {
  const [params] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [events, setEvents] = useState([]);
  const [classification, setClassification] = useState("");

  // NEW: keep cities + user flight bookings + which card is busy
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

        // Load Cities + user's flight bookings (best effort if not logged in)
        const [citiesList, userBookings] = await Promise.all([
          fetchCities(),
          fetchFlightBookings().catch(() => []),
        ]);
        if (cancelled) return;
        setCities(citiesList);
        setBookings(Array.isArray(userBookings) ? userBookings : []);

        // Resolve full city name and fetch events
        const cityName = resolveCityName(destinationParam, citiesList);
        if (!cityName) {
          throw new Error(
            `Could not resolve city name from "${destinationParam}". Please seed your Cities table.`
          );
        }

        const results = await fetchTicketmasterEvents({
          city: cityName,
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

  // NEW: minimal booking handler
  async function handleBook(ev) {
    try {
      setBusyId(ev.id);

      // 1) map event city -> City record
      const cityRec =
        cities.find(
          (c) => (c.city || "").toLowerCase() === (ev.city || "").toLowerCase()
        ) ||
        // fallback to the resolved destination if TM city name differs
        cities.find(
          (c) =>
            (c.city || "").toLowerCase() ===
            resolveCityName(destinationParam, cities).toLowerCase()
        );
      if (!cityRec)
        throw new Error("Couldn't map event city to a City record.");

      // 2) pick a flight booking to associate (most recent)
      if (!bookings?.length) {
        throw new Error("No flight booking found. Please book a flight first.");
      }
      const chosen = [...bookings].sort(
        (a, b) =>
          new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
      )[0];

      // 3) create the activity booking (basic defaults)
      const res = await createActivityBooking(
        ensureDateTimeZ(ev.startDateTime), // activityDateTime
        cityRec.id, // locationCityId
        1, // numberOfPeople
        ev.classificationName || "General", // category
        ev.name, // activityName
        ev.eventUrl, // activityUrl
        "0.00", // totalPrice (string for Decimal)
        chosen.id, // flightBookingId
        ev.imageUrl || "" // imageUrl
      );

      if (!res?.success) {
        throw new Error(res?.errors?.join(", ") || "Booking failed");
      }

      alert("Activity saved to your trip!");
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
            <ActivityCard
              key={ev.id}
              ev={ev}
              onBook={handleBook} // NEW
              busy={busyId === ev.id} // NEW
            />
          ))}
        </ul>
      )}
    </section>
  );
}
