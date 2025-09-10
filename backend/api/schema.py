import graphene
from api.graphql.queries.user_queries import UserQueries
from api.graphql.mutations.auth_mutations import AuthMutations
from api.graphql.queries.city_queries import CityQueries

class Query(UserQueries, CityQueries, graphene.ObjectType):
    pass

class Mutation(AuthMutations, graphene.ObjectType):
    pass

schema = graphene.Schema(query=Query, mutation=Mutation)
