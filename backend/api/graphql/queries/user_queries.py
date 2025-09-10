import graphene
from graphene_django import DjangoObjectType
from django.contrib.auth import get_user_model

class UserType(DjangoObjectType):
    class Meta:
        model = get_user_model()
        fields = ("id", "email", "username")

class UserQueries(graphene.ObjectType):
    me = graphene.Field(UserType)

    def resolve_me(root, info):
        user = info.context.user
        return user if getattr(user, "is_authenticated", False) else None
