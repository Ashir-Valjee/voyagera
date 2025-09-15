import graphene
from django.contrib.auth import get_user_model
from api.models import Profile
from ...models import City 
from ..types.profile_type import ProfileType
from graphql import GraphQLError
from ..utils.auth import require_user
from graphene_file_upload.scalars import Upload


class UpdateProfileMutation(graphene.Mutation):
    profile = graphene.Field(ProfileType)
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)

    class Arguments:
        # id = graphene.ID(required=True)
        profile_pic = Upload(required=False)
        home_city_id = graphene.ID(required=True)
        likes_music = graphene.Boolean(required=True)
        likes_sports = graphene.Boolean(required=True)
        likes_arts = graphene.Boolean(required=True)
        likes_film = graphene.Boolean(required=True)
        likes_family = graphene.Boolean(required=True)

    @classmethod
    def mutate(cls, root, info, **kwargs):
        user = require_user(info)
        profile = Profile.objects.get(user=user)
        home_city = City.objects.get(pk=kwargs.get("home_city_id"))

        profile.likes_music = kwargs.get("likes_music")
        profile.likes_sports = kwargs.get("likes_sports")
        profile.likes_arts = kwargs.get("likes_arts")
        profile.likes_film = kwargs.get("likes_film")
        profile.likes_family = kwargs.get("likes_family")
        profile.home_city = home_city
        profile_pic = kwargs.get("profile_pic")
        if profile_pic:
                profile.profile_pic = profile_pic

        profile.save()

        return UpdateProfileMutation(
            profile=profile,
            success=True,
            errors=[]
        )


class ProfileMutation(graphene.ObjectType):
    update_profile = UpdateProfileMutation.Field()