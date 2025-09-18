import graphene
from graphene_django import DjangoObjectType
from graphql import GraphQLError
from ..types.flight_booking_type import FlightBookingType
from ...models.flight_booking import FlightBooking
from ..utils.auth import require_user


class FlightBookingQueries(graphene.ObjectType):
    flight_bookings = graphene.List(
        FlightBookingType,
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