import graphene 
from graphene_django import DjangoObjectType
from ..types.activity_booking_type import ActivityBookingType
from ...models.activity_booking import ActivityBooking

class ActivityBookingQueries(graphene.ObjectType):
    activity_booking_by_flight_id = graphene.List(
        ActivityBookingType,
        flight_booking_id = graphene.Int(required=True)
    )

    single_activity_booking = graphene.Field(
        ActivityBookingType,
        id = graphene.Int(required=True)
    )


    def resolve_activity_booking_by_flight_id(self,info, flight_booking_id):
        return ActivityBooking.objects.filter(flight_booking_id=flight_booking_id)
    
    def resolve_single_activity_booking(self,info,id):
        return ActivityBooking.objects.get(id=id)