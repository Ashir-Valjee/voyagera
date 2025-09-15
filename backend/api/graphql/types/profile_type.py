
import graphene
from graphene_django import DjangoObjectType
from api.models import Profile

class ProfileType(DjangoObjectType):
    profilePicUrl = graphene.String()

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

    def resolve_profilePicUrl(self, info):
        if self.profile_pic:
            return self.profile_pic.url
        return None
