export default function ActivityCard({ ev, onBook, busy = false }) {
  const label = ev.uiCategory || "Family";

  function prettyWhen(s) {
    if (!s) return "";
    const d = new Date(s);
    if (!isNaN(d)) {
      return d.toLocaleString(undefined, {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    try {
      const [y, m, dd] = s.split("-");
      return new Date(Number(y), Number(m) - 1, Number(dd)).toLocaleDateString(
        undefined,
        { weekday: "short", year: "numeric", month: "short", day: "numeric" }
      );
    } catch {
      return s;
    }
  }

  return (
    <li className="card bg-base-100 shadow-md overflow-hidden">
      {ev.imageUrl && (
        <figure className="aspect-[16/9]">
          <img
            src={ev.imageUrl}
            alt={ev.name}
            className="w-full h-full object-cover"
          />
        </figure>
      )}
      <div className="card-body">
        <div className="flex items-start justify-between gap-2">
          <h3 className="card-title text-base leading-tight">{ev.name}</h3>
          <span className="badge badge-outline shrink-0">{label}</span>
        </div>

        <p className="text-sm opacity-80">{ev.city}</p>
        <p className="text-xs opacity-70">{prettyWhen(ev.startDateTime)}</p>

        <div className="card-actions justify-between mt-2">
          <a
            className="btn btn-sm"
            href={ev.eventUrl}
            target="_blank"
            rel="noreferrer"
          >
            Details
          </a>
          <button
            className={`btn btn-sm btn-primary ${busy ? "btn-disabled" : ""}`}
            onClick={() => onBook?.(ev)}
            disabled={busy}
            title="Save this activity"
          >
            {busy ? (
              <>
                <span className="loading loading-spinner loading-xs" /> Booking…
              </>
            ) : (
              "Book"
            )}
          </button>
        </div>
      </div>
    </li>
  );
}
