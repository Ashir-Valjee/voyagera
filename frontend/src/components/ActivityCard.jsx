export default function ActivityCard({
  ev,
  onBook,
  busy = false,
  peopleCount = 1,
}) {
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
    return s;
  }

  function fmt(n) {
    if (n == null) return "";
    const num = Number(n);
    if (!isFinite(num)) return String(n);
    const isInt = Math.abs(num - Math.round(num)) < 1e-9;
    return num.toLocaleString(undefined, {
      minimumFractionDigits: isInt ? 0 : 2,
      maximumFractionDigits: 2,
    });
  }

  // Price badge (group price = unit * peopleCount)
  const ccy = ev.priceCurrency || "";
  const unitMin = ev.priceMin;
  const unitMax = ev.priceMax;

  const groupMin = unitMin != null ? unitMin * peopleCount : null;
  const groupMax = unitMax != null ? unitMax * peopleCount : null;

  let priceText = "Price TBA";
  if (groupMin != null || groupMax != null) {
    if (groupMin != null && groupMax != null && groupMin !== groupMax) {
      priceText = `${ccy ? `${ccy} ` : ""}${fmt(groupMin)}–${fmt(groupMax)}`;
    } else {
      const one = groupMin ?? groupMax;
      priceText = `${ccy ? `${ccy} ` : ""}${fmt(one)}`;
    }
  } else if (ccy) {
    priceText = `${ccy} TBA`;
  }

  return (
    <li className="card bg-base-100 shadow-md overflow-hidden">
      {ev.imageUrl && (
        <figure className="aspect-[16/9]">
          <img
            src={ev.imageUrl}
            alt={ev.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </figure>
      )}

      <div className="card-body">
        <div className="flex items-start justify-between gap-2">
          <h3 className="card-title text-base leading-tight">{ev.name}</h3>
          <div className="flex items-center gap-2">
            <span className="badge badge-outline">{label}</span>
          </div>
        </div>

        <p className="text-sm opacity-80">{ev.city}</p>
        <p className="text-xs opacity-70">{prettyWhen(ev.startDateTime)}</p>
        <h3 className="text-m">{priceText}</h3>

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
