from graphene_django import DjangoObjectType
from api.models import FlightBooking

class FlightBookingType(DjangoObjectType):

    class Meta:
        model = FlightBooking
        fields = (
            "id",
            "user",
            "departure_city",
            "destination_city",
            "destination_airport",
            "departure_airport",
            "date_created",
            "departure_date_time",
            "arrival_date_time",
            "flight_duration",
            "number_of_stops",
            "number_of_passengers",
            "total_price"
        )