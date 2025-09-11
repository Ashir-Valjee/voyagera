import graphene
from graphene_django import DjangoObjectType
from ...models import FlightBooking, City
from ..types.flight_booking_type import FlightBookingType
from graphql import GraphQLError
from ..utils.auth import require_user

class CreateFlightBookingMutation(graphene.Mutation):
    flight_booking = graphene.Field(FlightBookingType)
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)

    class Arguments:
        # The input arguments for this mutation
        departure_city_id = graphene.ID(required=True)
        destination_city_id = graphene.ID(required=True)
        destination_airport = graphene.String(required=True)
        departure_airport = graphene.String(required=True)
        # date_created = graphene.DateTime(required=True)
        departure_date_time = graphene.DateTime(required=True)
        arrival_date_time = graphene.DateTime(required=True)
        flight_duration = graphene.Decimal(required=True)
        number_of_stops = graphene.Int(required=True)
        number_of_passengers = graphene.Int(required=True)
        total_price = graphene.Decimal(required=True)
        
    @classmethod
    def mutate(cls, root, info, **kwargs):
        user = require_user(info)
        departure_city = City.objects.get(pk=kwargs.get("departure_city_id"))
        destination_city = City.objects.get(pk=kwargs.get("destination_city_id"))
        

        create_flight_booking = FlightBooking.objects.create(
            user=user,
            departure_city=departure_city,
            destination_city=destination_city,
            destination_airport=kwargs.get("destination_airport"),
            departure_airport=kwargs.get("departure_airport"),
            # date_created=kwargs.get("date_created"),
            departure_date_time=kwargs.get("departure_date_time"),
            arrival_date_time=kwargs.get("arrival_date_time"),
            flight_duration=kwargs.get("flight_duration"),
            number_of_stops=kwargs.get("number_of_stops"),
            number_of_passengers=kwargs.get("number_of_passengers"),
            total_price=kwargs.get("total_price")
        )

        # Notice we return an instance of this mutation
        return CreateFlightBookingMutation(
            flight_booking=create_flight_booking, 
            success=True,
            errors=[]
        )


class FlightBookingMutations(graphene.ObjectType):
    create_flight_booking = CreateFlightBookingMutation.Field()
