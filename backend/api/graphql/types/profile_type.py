from graphene_django import DjangoObjectType
from api.models import Profile

class ProfileType(DjangoObjectType):
    class Meta:
        model = Profile
        fields = (
            "id",
            "profile_pic",
            "home_city",
            "likes_music",
            "likes_sports",
            "likes_arts",
            "likes_film",
            "likes_family",
        )
