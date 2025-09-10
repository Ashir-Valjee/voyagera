from graphene_django import DjangoObjectType
from api.models import ActivityBooking

class ActivityBookingType(DjangoObjectType):
    class Meta:
        model = ActivityBooking
        fields = (
            "id",
            "date_created",
            "activity_date_time",
            "location_city",
            "number_of_people",
            "category",
            "activity_name",
            "activity_url",
            "total_price",
            "flight_booking"
        )