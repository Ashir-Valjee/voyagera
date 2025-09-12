import graphene
from graphql import GraphQLError
from ..types.ticketmaster_type import TicketmasterType
from ...lib.ticketmaster import search_ticketmaster_events

def map_event(event):
    venue = (event.get("_embedded", {}).get("venues") or [{}])[0] or {}
    city = (venue.get("city") or {}).get("name")

    # Classification (category) information
    classifications = event.get("classifications", [{}])
    classification_name = classifications[0].get("segment", {}).get("name") if classifications else None
    
    # Date information
    dates = event.get("dates", {})
    start_date_time = dates.get("start", {}).get("dateTime") or dates.get("start", {}).get("localDate")
    
    # Country information
    country = (venue.get("country") or {}).get("name")
    
    # Image URL (get the first high-quality image)
    images = event.get("images", [])
    image_url = None
    if images:
        # Try to get a medium/large image
        for img in images:
            if img.get("width", 0) >= 300:
                image_url = img.get("url")
                break
        # Fallback to first image if no suitable size found
        if not image_url:
            image_url = images[0].get("url")
    
    # Event URL
    event_url = event.get("url")

    return {
        "id": event.get("id"),
        "name": event.get("name"),
        "city": city,
        "classification_name": classification_name,
        "start_date_time": start_date_time,
        "country": country,
        "image_url": image_url,
        "event_url": event_url
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

        # Filter out attractions if you only want events with dates
        events = []
        for event in raw:
            mapped_event = map_event(event)
            
            # Only include events that have actual date/time (optional filter)
            if mapped_event["start_date_time"] or not start_date_time:
                events.append(mapped_event)
        
        return events