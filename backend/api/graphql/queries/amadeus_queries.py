import graphene
from graphql import GraphQLError
from ..types.amadeus_type import AmadeusType
from ...lib.amadeus import search_flight_offers

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
