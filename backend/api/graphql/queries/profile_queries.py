import graphene 
from graphene_django import DjangoObjectType
from ..types.profile_type import ProfileType
from ...models.profile import Profile

class ProfileQueries(graphene.ObjectType):
    get_user_profile = graphene.Field(
        ProfileType,
        profile_id = graphene.Int(required=True)
    )

    def resolve_get_user_profile(self, info, profile_id):
        return Profile.objects.get(pk = profile_id)