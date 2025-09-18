import { toYMD, formatIsoToYMDHM } from "../utils/dates";
import {
  computeMinutesBetween,
  formatMinutes,
  stopLabel,
} from "../utils/helpers";
import PlaneLogo from "../assets/plane-logo.jpg"

export default function FlightCard({
  offer,
  onSelect,
  busy = false,
  passengers = 1,
}) {
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
    <li className="list-row items-start">
      <div>
        <img className="size-10 rounded-box" src={PlaneLogo} alt="" />
      </div>

      <div className="min-w-0 flex-1">
        {/* Header: route, price, total duration, passengers */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <div className="truncate font-semibold text-lg md:text-xl">
                {offer.outDepartureIata} &#x2192; {offer.outArrivalIata}
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

            <div className="text-xs uppercase font-semibold opacity-60 mt-1">
              {outDate}
              {hasReturn ? `  ·  ${retDate}` : ""}
            </div>
          </div>

          <div className="shrink-0">
            <button
              className={`btn btn-primary ${busy ? "btn-disabled" : ""}`}
              disabled={busy}
              title={busy ? "Booking…" : "Select"}
              onClick={() => onSelect?.(offer)}
              aria-busy={busy ? "true" : "false"}
            >
              {busy ? (
                <>
                  <span className="loading loading-spinner loading-xs" />{" "}
                  Booking…
                </>
              ) : (
                "Book"
              )}
            </button>
          </div>
        </div>

        {/* Details: spread over more lines, slightly larger */}
        <div className="mt-3 space-y-3">
          <div>
            <div className="text-sm font-semibold">Outbound</div>
            <div className="text-sm">
              {formatIsoToYMDHM(offer.outDepartureAt)} &#x2192;{" "}
              {formatIsoToYMDHM(offer.outArrivalAt)}
            </div>
            <div className="text-xs opacity-75">
              {outMins ? formatMinutes(outMins) : null}
              {offer.outCarrierCode ? (
                <>
                  {" "}
                  · {offer.outCarrierCode}
                  {offer.outFlightNumber ? ` ${offer.outFlightNumber}` : ""}
                </>
              ) : null}
              {offer.outStops !== null && offer.outStops !== undefined ? (
                <> · {stopLabel(offer.outStops)}</>
              ) : null}
            </div>
          </div>

          {hasReturn && (
            <div>
              <div className="text-sm font-semibold">Return</div>
              <div className="text-sm">
                {formatIsoToYMDHM(offer.retDepartureAt)} &#x2192;{" "}
                {formatIsoToYMDHM(offer.retArrivalAt)}
              </div>
              <div className="text-xs opacity-75">
                {retMins ? formatMinutes(retMins) : null}
                {offer.retCarrierCode ? (
                  <>
                    {" "}
                    · {offer.retCarrierCode}
                    {offer.retFlightNumber ? ` ${offer.retFlightNumber}` : ""}
                  </>
                ) : null}
                {offer.retStops !== null && offer.retStops !== undefined ? (
                  <> · {stopLabel(offer.retStops)}</>
                ) : null}
                <span className="badge shrink-0">
                  {passengers} {passengers === 1 ? "passenger" : "passengers"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
