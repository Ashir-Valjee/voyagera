import graphene
from django.contrib.auth import get_user_model
from api.models import Profile
from ...models import City 
from ..types.profile_type import ProfileType
from graphql import GraphQLError
from ..utils.auth import require_user


class UpdateProfileMutation(graphene.Mutation):
    profile = graphene.Field(ProfileType)
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)

    class Arguments:
        id = graphene.ID(required=True)
        profile_pic_url = graphene.String()
        home_city_id = graphene.ID()
        first_name = graphene.String()
        last_name = graphene.String()
        likes_music = graphene.Boolean()
        likes_sports = graphene.Boolean()
        likes_arts = graphene.Boolean()
        likes_film = graphene.Boolean()
        likes_family = graphene.Boolean()

    @classmethod
    def mutate(cls, root, info, **kwargs):
        user = require_user(info)
        profile = Profile.objects.get(pk=kwargs.get("id"),user=user)

        if "first_name" in kwargs:
            profile.first_name = kwargs["first_name"]
        if "last_name" in kwargs:
            profile.last_name = kwargs["last_name"]
        if "likes_music" in kwargs:
            profile.likes_music = kwargs["likes_music"]
        if "likes_sports" in kwargs:
            profile.likes_sports = kwargs["likes_sports"]
        if "likes_arts" in kwargs:
            profile.likes_arts = kwargs["likes_arts"]
        if "likes_film" in kwargs:
            profile.likes_film = kwargs["likes_film"]
        if "likes_family" in kwargs:
            profile.likes_family = kwargs["likes_family"]
        if "profile_pic_url" in kwargs:
            profile.profile_pic_url = kwargs["profile_pic_url"]
        if "home_city_id" in kwargs:
            try:
                home_city = City.objects.get(pk=kwargs["home_city_id"])
                profile.home_city = home_city
            except City.DoesNotExist:
                raise GraphQLError("Home city not found")

        profile.save()

        return UpdateProfileMutation(
            profile=profile,
            success=True,
            errors=[]
        )


class ProfileMutation(graphene.ObjectType):
    update_profile = UpdateProfileMutation.Field()