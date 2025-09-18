import { toYMD, formatIsoToYMDHM } from "../utils/dates";
import {
  computeMinutesBetween,
  formatMinutes,
  stopLabel,
} from "../utils/helpers";

export default function FlightCard({ offer, onSelect }) {
  const hasReturn = Boolean(offer.retDepartureIata);

  const outDate = toYMD(offer.outDepartureAt);
  const retDate = hasReturn ? toYMD(offer.retDepartureAt) : null;

  const outMins =
    offer.outDurationMinutes ??
    computeMinutesBetween(offer.outDepartureAt, offer.outArrivalAt);

  const retMins = hasReturn
    ? offer.retDurationMinutes ??
      computeMinutesBetween(offer.retDepartureAt, offer.retArrivalAt)
    : 0;

  const totalMins =
    offer.totalDurationMinutes ??
    (outMins || 0) + (hasReturn ? retMins || 0 : 0);

  return (
    <li className="list-row">
      <div>
        <img className="size-10 rounded-box" src="plane-logo.jpg" alt="" />
      </div>

      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          <div className="truncate font-medium">
            {offer.outDepartureIata} → {offer.outArrivalIata}
          </div>
          <span className="badge badge-neutral shrink-0">
            {offer.priceCurrency} {offer.priceTotal}
          </span>
          {!!totalMins && (
            <span
              className="badge badge-outline shrink-0"
              title="Total duration"
            >
              {formatMinutes(totalMins)}
            </span>
          )}
        </div>

        <div className="text-xs uppercase font-semibold opacity-60">
          {outDate}
          {hasReturn ? `  •  ${retDate}` : ""}
        </div>

        <div className="text-xs opacity-70 mt-1">
          Outbound: {formatIsoToYMDHM(offer.outDepartureAt)} →{" "}
          {formatIsoToYMDHM(offer.outArrivalAt)}
          {outMins ? <> · {formatMinutes(outMins)}</> : null}
          {offer.outCarrierCode && (
            <>
              {" "}
              · {offer.outCarrierCode}
              {offer.outFlightNumber ? ` ${offer.outFlightNumber}` : ""}
            </>
          )}
          {offer.outStops !== null && offer.outStops !== undefined && (
            <> · {stopLabel(offer.outStops)}</>
          )}
        </div>

        {hasReturn && (
          <div className="text-xs opacity-70">
            Return: {formatIsoToYMDHM(offer.retDepartureAt)} →{" "}
            {formatIsoToYMDHM(offer.retArrivalAt)}
            {retMins ? <> · {formatMinutes(retMins)}</> : null}
            {offer.retCarrierCode && (
              <>
                {" "}
                · {offer.retCarrierCode}
                {offer.retFlightNumber ? ` ${offer.retFlightNumber}` : ""}
              </>
            )}
            {offer.retStops !== null && offer.retStops !== undefined && (
              <> · {stopLabel(offer.retStops)}</>
            )}
          </div>
        )}
      </div>

      <button
        className="btn btn-primary"
        title="Select"
        onClick={() => onSelect?.(offer)}
      >
        Book
      </button>
    </li>
  );
}
