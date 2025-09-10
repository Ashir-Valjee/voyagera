import graphene
from graphene_django import DjangoObjectType
from ..types.flight_booking_type import FlightBookingType
from ...models.flight_booking import FlightBooking



class FlightBookingQueries(graphene.ObjectType):
    flight_bookings = graphene.List(
        FlightBookingType,
        user_id = graphene.Int(required=True)
        )

    def resolve_flight_bookings(self,info,user_id):
        return FlightBooking.objects.filter(user__id=user_id)