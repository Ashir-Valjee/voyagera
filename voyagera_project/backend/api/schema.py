import graphene
from api.graphql.queries.user_queries import UserQueries
from api.graphql.mutations.auth_mutations import AuthMutations
from api.graphql.queries.city_queries import CityQueries
from api.graphql.queries.flight_booking_queries import FlightBookingQueries
from api.graphql.queries.activity_booking_queries import ActivityBookingQueries
from api.graphql.queries.profile_queries import ProfileQueries
from api.graphql.queries.ticketmaster_queries import TicketMasterQueries
from api.graphql.queries.amadeus_queries import AmadeusQueries
from api.graphql.mutations.flight_booking_mutations import FlightBookingMutations
from api.graphql.mutations.activity_booking_mutations import ActivityBookingMutations
from api.graphql.mutations.profile_mutations import ProfileMutation

class Query(UserQueries, CityQueries,FlightBookingQueries, ActivityBookingQueries, ProfileQueries, TicketMasterQueries, AmadeusQueries, graphene.ObjectType):
    pass

class Mutation(AuthMutations, FlightBookingMutations, ActivityBookingMutations, ProfileMutation, graphene.ObjectType):
    pass

schema = graphene.Schema(query=Query, mutation=Mutation)
