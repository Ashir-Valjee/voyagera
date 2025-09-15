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
        home_city_id = graphene.ID(required=False)
        likes_music = graphene.Boolean(required=False)
        likes_sports = graphene.Boolean(required=False)
        likes_arts = graphene.Boolean(required=False)
        likes_film = graphene.Boolean(required=False)
        likes_family = graphene.Boolean(required=False)
        first_name = graphene.String(required=False)
        last_name = graphene.String(required=False)

    # @classmethod
    # def mutate(cls, root, info, **kwargs):
    #     user = require_user(info)

    #     profile = Profile.objects.get(user=user)
    #     home_city = City.objects.get(pk=kwargs.get("home_city_id"))

    #     profile.likes_music = kwargs.get("likes_music")
    #     profile.likes_sports = kwargs.get("likes_sports")
    #     profile.likes_arts = kwargs.get("likes_arts")
    #     profile.likes_film = kwargs.get("likes_film")
    #     profile.likes_family = kwargs.get("likes_family")
    #     profile.home_city = home_city
    #     profile.first_name = kwargs.get("first_name")
    #     profile.last_name = kwargs.get("last_name")
        
    #     profile_pic = kwargs.get("profile_pic")
    #     if profile_pic:
    #             profile.profile_pic = profile_pic

    #     profile.save()

    #     return UpdateProfileMutation(
    #         profile=profile,
    #         success=True,
    #         errors=[]
    #     )
    @classmethod
    def mutate(cls, root, info, **kwargs):
        user = require_user(info)
        
        try:
            # Securely fetch the profile using the authenticated user
            profile = Profile.objects.get(user=user)

            # Update all fields on the Profile model
            if 'home_city_id' in kwargs:
                profile.home_city = City.objects.get(pk=kwargs.get('home_city_id'))
            
            # This will correctly handle first_name, last_name, likes_music, etc.
            # It loops through any other arguments provided in the mutation.
            for field in ['first_name', 'last_name', 'likes_music', 'likes_sports', 'likes_arts', 'likes_film', 'likes_family']:
                if field in kwargs:
                    setattr(profile, field, kwargs.get(field))

            # Handle the optional file upload separately
            if 'profile_pic' in kwargs:
                profile.profile_pic = kwargs.get('profile_pic')
            
            profile.save() 

            return UpdateProfileMutation(profile=profile, success=True)
        
        except (Profile.DoesNotExist, City.DoesNotExist):
            return UpdateProfileMutation(success=False, errors=["Profile or City not found."])


class ProfileMutation(graphene.ObjectType):
    update_profile = UpdateProfileMutation.Field()