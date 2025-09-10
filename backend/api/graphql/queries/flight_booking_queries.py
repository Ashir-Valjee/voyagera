import graphene
from graphene_django import DjangoObjectType
from ..types.flight_booking_type import FlightBookingType
from ...models.flight_booking import FlightBooking
from ...models.city import City


class FlightBookingQueries(graphene.ObjectType):
    flight_bookings = graphene.List(
        FlightBookingType,
        user_id = graphene.Int(required=True)
        )
    
    flight_booking_by_id = graphene.Field(
        FlightBookingType,
        flight_id= graphene.Int(required=True)
        )

    def resolve_flight_bookings(self,info,user_id):
        return FlightBooking.objects.filter(user__id=user_id)
    
    def resolve_flight_booking_by_id(self,info,flight_id):
        return FlightBooking.objects.get(pk=flight_id)
    