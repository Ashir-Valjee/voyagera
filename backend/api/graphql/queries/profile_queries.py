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
    


    # for info purposes, if you want to search any Profile

    # profile_by_id = graphene.Field(ProfileType, id=graphene.ID(required=True))

    # def resolve_profile_by_id(self, info, id):
    #     require_user(info)  # just check they're logged in
    #     prof = (Profile.objects
    #             .get(pk=id)
    #             )
    #     if not prof:
    #         raise GraphQLError("Profile not found")
    #     return prof