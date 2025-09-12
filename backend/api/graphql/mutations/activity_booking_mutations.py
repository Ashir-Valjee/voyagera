import graphene
from graphene_django import DjangoObjectType
from ...models import ActivityBooking, FlightBooking, City
from ..types.activity_booking_type import ActivityBookingType 
from graphql import GraphQLError
from ..utils.auth import require_user

class CreateActivityBookingMutation(graphene.Mutation):
    activity_booking = graphene.Field(ActivityBookingType)
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)
    
    class Arguments:
        activity_date_time = graphene.DateTime(required=True)
        location_city_id = graphene.ID(required=True)
        number_of_people = graphene.Int(required=True)
        category = graphene.String(required=True)
        activity_name = graphene.String(required=True)
        activity_url = graphene.String(required=True)
        total_price = graphene.Decimal(required=True)
        flight_booking_id = graphene.ID(required=True)
        
    @classmethod
    def mutate(cls, root, info, **kwargs):
        require_user(info)
        flight_booking = FlightBooking.objects.get(pk=kwargs.get("flight_booking_id"))
        location_city = City.objects.get(pk=kwargs.get("location_city_id"))
        
        create_activity_booking = ActivityBooking.objects.create(
            activity_date_time=kwargs.get("activity_date_time"),
            location_city=location_city,
            number_of_people=kwargs.get("number_of_people"),
            category=kwargs.get("category"),
            activity_name=kwargs.get("activity_name"),
            activity_url=kwargs.get("activity_url"),
            total_price=kwargs.get("total_price"),
            flight_booking=flight_booking
        )
        
        return CreateActivityBookingMutation(
            activity_booking=create_activity_booking,
            success = True,
            errors=[]
        )
        
class UpdateActivityBookingMutation(graphene.Mutation):
    activity_booking = graphene.Field(ActivityBookingType)     
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)
    
    class Arguments:
        id = graphene.ID(required=True)
        number_of_people = graphene.Int(required=True)
        total_price = graphene.Decimal(required=True)
        
    @classmethod
    def mutate(cls, root, info, **kwargs):
        require_user(info)
        activity_booking = ActivityBooking.objects.get(pk=kwargs.get("id"))
        
        activity_booking.number_of_people = kwargs.get("number_of_people")
        activity_booking.total_price = kwargs.get("total_price")
        activity_booking.save()
        
        return UpdateActivityBookingMutation(
            activity_booking=activity_booking,
            success=True,
            errors=[]
        )
        
class DeleteActivityBookingMutation(graphene.Mutation):
    activity_booking = graphene.Field(ActivityBookingType)
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)

    class Arguments:
        id = graphene.ID(required=True)
    
    @classmethod
    def mutate(cls, root, info, **kwargs):
        require_user(info)
        activity_booking = ActivityBooking.objects.get(pk=kwargs.get("id"))
        activity_booking.delete()

        return DeleteActivityBookingMutation(
            activity_booking=activity_booking, 
            success=True,
            errors=[]
        )
        
class ActivityBookingMutations(graphene.ObjectType):
    create_activity_booking = CreateActivityBookingMutation.Field()
    update_activity_booking = UpdateActivityBookingMutation.Field()
    delete_activity_booking = DeleteActivityBookingMutation.Field()