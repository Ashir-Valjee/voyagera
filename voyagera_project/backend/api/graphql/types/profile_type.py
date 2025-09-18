
import graphene
from graphene_django import DjangoObjectType
from api.models import Profile
from django.conf import settings

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
        
    def resolve_profile_pic(self, info):
        if self.profile_pic:
            return f"https://{settings.AWS_S3_CUSTOM_DOMAIN}/{self.profile_pic}"
        return None

