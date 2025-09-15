// src/components/FlightCard.jsx
import { toYMD, formatIsoToYMDHM } from "../utils/dates";

export default function FlightCard({ offer, onSelect }) {
  const hasReturn = Boolean(offer.retDepartureIata);

  const outDate = toYMD(offer.outDepartureAt);
  const retDate = hasReturn ? toYMD(offer.retDepartureAt) : null;

  return (
    <li className="list-row">
      {/* left icon / avatar */}
      <div>
        <div className="size-10 rounded-box bg-base-200 grid place-items-center text-xs font-semibold">
          {offer.outDepartureIata}
        </div>
      </div>

      {/* main content */}
      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          <div className="truncate font-medium">
            {offer.outDepartureIata} → {offer.outArrivalIata}
          </div>
          <span className="badge badge-neutral shrink-0">
            {offer.priceCurrency} {offer.priceTotal}
          </span>
        </div>

        <div className="text-xs uppercase font-semibold opacity-60">
          {outDate}
          {hasReturn ? `  •  ${retDate}` : ""}
        </div>

        <div className="text-xs opacity-70 mt-1">
          Outbound: {formatIsoToYMDHM(offer.outDepartureAt)} →{" "}
          {formatIsoToYMDHM(offer.outArrivalAt)}
          {offer.outCarrierCode && (
            <>
              {" "}
              · {offer.outCarrierCode}
              {offer.outFlightNumber ? ` ${offer.outFlightNumber}` : ""}
            </>
          )}
          {offer.outStops !== null && offer.outStops !== undefined && (
            <> · {offer.outStops} stop(s)</>
          )}
        </div>

        {hasReturn && (
          <div className="text-xs opacity-70">
            Return: {formatIsoToYMDHM(offer.retDepartureAt)} →{" "}
            {formatIsoToYMDHM(offer.retArrivalAt)}
            {offer.retCarrierCode && (
              <>
                {" "}
                · {offer.retCarrierCode}
                {offer.retFlightNumber ? ` ${offer.retFlightNumber}` : ""}
              </>
            )}
            {offer.retStops !== null && offer.retStops !== undefined && (
              <> · {offer.retStops} stop(s)</>
            )}
          </div>
        )}
      </div>

      <button
        className="btn  btn-primary"
        title="Select"
        onClick={() => onSelect?.(offer)}
      >
        Book
      </button>
    </li>
  );
}
