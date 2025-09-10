import graphene
from api.graphql.queries.user_queries import UserQueries
from api.graphql.mutations.auth_mutations import AuthMutations

class Query(UserQueries, graphene.ObjectType):
    pass

class Mutation(AuthMutations, graphene.ObjectType):
    pass

schema = graphene.Schema(query=Query, mutation=Mutation)
