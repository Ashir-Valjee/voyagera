import graphene
from graphql import GraphQLError
from ..types.ticketmaster_type import TicketmasterType
from ...lib.ticketmaster import search_ticketmaster_events

def map_event(event):
    venue = (event.get("_embedded", {}).get("venues") or [{}])[0] or {}
    city = (venue.get("city") or {}).get("name")

    return {
        "id": event.get("id"),
        "name": event.get("name"),
        "city": city
    }

class TicketMasterQueries(graphene.ObjectType):
    ticketmaster_events = graphene.List(
        TicketmasterType,
        city = graphene.String(),
        country_code = graphene.String(default_value="GB"),
        start_date_time = graphene.String(),
        end_date_time = graphene.String(),
        classification_name = graphene.String(),
        size = graphene.Int(default_value=20)
    )

    def resolve_ticketmaster_events(
            self,
            info,
            country_code="GB",
            city=None,
            start_date_time=None,
            end_date_time=None,
            classification_name=None,
            size=20
    ):
        raw = search_ticketmaster_events(
            countryCode=country_code,
            city=city,
            startDateTime=start_date_time,
            endDateTime=end_date_time,
            classificationName=classification_name,
            size=size
        )

        return [map_event(event) for event in raw]