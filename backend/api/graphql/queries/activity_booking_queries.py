import graphene 
from graphene_django import DjangoObjectType
from graphql import GraphQLError
from ..types.activity_booking_type import ActivityBookingType
from ...models.activity_booking import ActivityBooking
from ..utils.auth import require_user

class ActivityBookingQueries(graphene.ObjectType):
    activityBookingsByFlightId = graphene.List(
        ActivityBookingType,
        flight_booking_id = graphene.Int(required=True)
    )

    single_activity_booking = graphene.Field(
        ActivityBookingType,
        id = graphene.Int(required=True)
    )
    
    activity_bookings_by_user = graphene.List(
        ActivityBookingType
    )


    def resolve_activityBookingsByFlightId(self,info, flight_booking_id):
        user = require_user(info)
        my_activities =  ActivityBooking.objects.filter(flight_booking_id=flight_booking_id, flight_booking__user=user)
        if not my_activities:
            raise GraphQLError("no activities found")
        return my_activities
    
    def resolve_single_activity_booking(self,info,id):
        user = require_user(info)
        activity =  ActivityBooking.objects.get(id=id, flight_booking__user=user)
        if not activity:
            raise GraphQLError("no activities found")
        return activity
    
    def resolve_activity_bookings_by_user(self, info):
        user = require_user(info)
        activity = ActivityBooking.objects.filter(flight_booking__user=user)
        if not activity:
            raise GraphQLError("no activities found")
        return activity