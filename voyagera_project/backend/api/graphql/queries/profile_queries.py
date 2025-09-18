import graphene 
from graphene_django import DjangoObjectType
from graphql import GraphQLError
from ..types.profile_type import ProfileType
from ...models.profile import Profile
from ..utils.auth import require_user

class ProfileQueries(graphene.ObjectType):
    get_user_profile = graphene.Field(
        ProfileType,
    )

    def resolve_get_user_profile(self, info):
        user = require_user(info)
        return Profile.objects.get(user=user)
    
