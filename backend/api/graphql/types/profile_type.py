from graphene_django import DjangoObjectType
from api.models import Profile

class ProfileType(DjangoObjectType):
    class Meta:
        model = Profile
        fields = (
            "id",
            "profile_pic",
            "home_city",
            "first_name",
            "last_name",
            "likes_music",
            "likes_sports",
            "likes_arts",
            "likes_film",
            "likes_family",
        )
