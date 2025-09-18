import graphene
import re
from datetime import datetime
from graphql import GraphQLError
from ..types.amadeus_type import AmadeusType
from ...lib.amadeus import search_flight_offers

DUR_RE = re.compile(
    r"^P(?:(?P<days>\d+)D)?(?:T(?:(?P<hours>\d+)H)?(?:(?P<minutes>\d+)M)?(?:(?P<seconds>\d+)S)?)?$"
)

def iso_duration_to_minutes(s: str) -> int:
    if not s:
        return 0
    m = DUR_RE.match(s)
    if not m:
        return 0
    days = int(m.group("days") or 0)
    hours = int(m.group("hours") or 0)
    minutes = int(m.group("minutes") or 0)
    seconds = int(m.group("seconds") or 0)
    total = days * 24 * 60 + hours * 60 + minutes
  
    if seconds:
        total += 1
    return total

def itinerary_duration_minutes(itinerary: dict) -> tuple[int, str | None]:
    
    if not itinerary:
        return 0, None
    dur_iso = itinerary.get("duration")
    if dur_iso:
        return iso_duration_to_minutes(dur_iso), dur_iso

    segs = itinerary.get("segments") or []
    if not segs:
        return 0, None
    dep_at = segs[0].get("departure", {}).get("at")
    arr_at = segs[-1].get("arrival", {}).get("at")
    try:
        tdep = datetime.fromisoformat(dep_at.replace("Z", "+00:00"))
        tarr = datetime.fromisoformat(arr_at.replace("Z", "+00:00"))
        mins = max(0, int((tarr - tdep).total_seconds() // 60))
        return mins, None
    except Exception:
        return 0, None

def extract_segment_summary(segment):
 
    departure = (segment or {}).get("departure") or {}
    arrival   = (segment or {}).get("arrival") or {}
    return {
        "departure_iata": departure.get("iataCode"),
        "departure_at":   departure.get("at"),
        "arrival_iata":   arrival.get("iataCode"),
        "arrival_at":     arrival.get("at"),
        "carrier_code":   (segment or {}).get("carrierCode"),
        "flight_number":  (segment or {}).get("number"),
        "stops":          (segment or {}).get("numberOfStops"),
    }


def map(offer):
    
    price = (offer.get("price") or {})
    itineraries = offer.get("itineraries") or []

 
    outbound_itinerary = itineraries[0] if len(itineraries) > 0 else {}
    return_itinerary   = itineraries[1] if len(itineraries) > 1 else {}

  
    outbound_segments = outbound_itinerary.get("segments") or []
    return_segments   = return_itinerary.get("segments") or []

    outbound_first_segment = outbound_segments[0] if outbound_segments else {}
    return_first_segment   = return_segments[0] if return_segments else {}

    out = extract_segment_summary(outbound_first_segment)
    back = extract_segment_summary(return_first_segment)

    # durations
    out_mins, out_iso = itinerary_duration_minutes(outbound_itinerary)
    ret_mins, ret_iso = itinerary_duration_minutes(return_itinerary)
    total_mins = out_mins + ret_mins

    def mins_to_hours(m): return round(m / 60.0, 2) if m else 0.0
    out_stops = out["stops"]
    if out_stops is None:
        out_stops = max(0, len(outbound_segments) - 1)
    ret_stops = back["stops"]
    if ret_stops is None:
        ret_stops = max(0, len(return_segments) - 1)

    return {
        "id": offer.get("id"),
        "price_total":    price.get("total"),
        "price_currency": price.get("currency"),

        "out_departure_iata": out["departure_iata"],
        "out_departure_at":   out["departure_at"],
        "out_arrival_iata":   out["arrival_iata"],
        "out_arrival_at":     out["arrival_at"],
        "out_carrier_code":   out["carrier_code"],
        "out_flight_number":  out["flight_number"],
        "out_stops":          out["stops"],

        "ret_departure_iata": back["departure_iata"],
        "ret_departure_at":   back["departure_at"],
        "ret_arrival_iata":   back["arrival_iata"],
        "ret_arrival_at":     back["arrival_at"],
        "ret_carrier_code":   back["carrier_code"],
        "ret_flight_number":  back["flight_number"],
        "ret_stops":          back["stops"],
        # NEW durations
        "out_duration_iso": out_iso,
        "out_duration_minutes": out_mins,
        "out_duration_hours": mins_to_hours(out_mins),

        "ret_duration_iso": ret_iso,
        "ret_duration_minutes": ret_mins,
        "ret_duration_hours": mins_to_hours(ret_mins),

        "total_duration_minutes": total_mins,
        "total_duration_hours": mins_to_hours(total_mins),
    }


class AmadeusQueries(graphene.ObjectType):
    amadeus_flight_offers = graphene.List(
        AmadeusType,
        origin=graphene.String(required=True),
        destination=graphene.String(required=True),
        departure_date=graphene.String(required=True),
        return_date=graphene.String(),
        adults=graphene.Int(default_value=1),
        non_stop=graphene.Boolean(default_value=False),
        max_results=graphene.Int(default_value=20),
        currency=graphene.String(default_value="GBP"),
    )

    def resolve_amadeus_flight_offers(
        self, info, origin, destination, departure_date,
        return_date=None, adults=1, non_stop=False, max_results=20, currency="GBP"
    ):
        try:
            offers = search_flight_offers(
                origin_code=origin,
                destination_code=destination,
                departure_date=departure_date,
                return_date=return_date,
                adults=adults,
                non_stop=non_stop,
                max_results=max_results,
                currency=currency,
            )
            return [map(offer) for offer in offers]
        except Exception as e:
            raise GraphQLError(str(e))
