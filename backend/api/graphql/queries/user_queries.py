import graphene
from ..types.user_type import UserType



class UserQueries(graphene.ObjectType):
    me = graphene.Field(UserType)

    def resolve_me(root, info):
        user = info.context.user
        return user if getattr(user, "is_authenticated", False) else None
