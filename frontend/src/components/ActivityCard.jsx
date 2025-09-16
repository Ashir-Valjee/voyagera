import { prettyWhen } from "../utils/helpers";

export default function ActivityCard({ ev, onBook, busy = false }) {
  // ev: { id, name, city, classificationName, startDateTime, imageUrl, eventUrl }

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
          {ev.classificationName && (
            <span className="badge badge-outline shrink-0">
              {ev.classificationName}
            </span>
          )}
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
