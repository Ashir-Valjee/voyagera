import graphene
from api.graphql.queries.user_queries import UserQueries
from api.graphql.mutations.auth_mutations import AuthMutations
from api.graphql.queries.city_queries import CityQueries
from api.graphql.queries.flight_booking_queries import FlightBookingQueries
from api.graphql.queries.activity_booking_queries import ActivityBookingQueries
from api.graphql.queries.profile_queries import ProfileQueries
from api.graphql.mutations.flight_booking_mutations import CreateFlightBookingMutation

class Query(UserQueries, CityQueries,FlightBookingQueries, ActivityBookingQueries, ProfileQueries, graphene.ObjectType):
    pass

class Mutation(AuthMutations, CreateFlightBookingMutation, graphene.ObjectType):
    pass

schema = graphene.Schema(query=Query, mutation=Mutation)
