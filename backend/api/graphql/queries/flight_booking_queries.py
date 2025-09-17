import graphene
from graphene_django import DjangoObjectType
from graphql import GraphQLError
from ..types.flight_booking_type import FlightBookingType
from ...models.flight_booking import FlightBooking
from ..utils.auth import require_user
from django.db.models import Count

class TopDestinationType(graphene.ObjectType):
    name = graphene.String()
    count = graphene.Int()
    
    
class FlightBookingQueries(graphene.ObjectType):
    flight_bookings = graphene.List(
        FlightBookingType,
        )
    
    top_destinations = graphene.List(
        TopDestinationType,
        limit=graphene.Int(default_value=5)
    )
    
    flight_booking_by_id = graphene.Field(
        FlightBookingType,
        flight_id= graphene.Int(required=True)
        )

    def resolve_flight_bookings(self,info):
        user = require_user(info)
        return FlightBooking.objects.filter(user=user)
    
    def resolve_flight_booking_by_id(self,info,flight_id):
        user = require_user(info)
        flight_booking =  FlightBooking.objects.get(id=flight_id, user=user)
        if not flight_booking:
            raise GraphQLError("Flight booking not found")
        return flight_booking
    
    def resolve_top_destinations(self, info, limit):
        top = (
            FlightBooking.objects
            .values("destination_city__city")
            .annotate(count=Count("destination_city__city"))
            .order_by("-count")[:limit]
        )
        return [TopDestinationType(name=item["destination_city__city"], count=item["count"]) for item in top]
