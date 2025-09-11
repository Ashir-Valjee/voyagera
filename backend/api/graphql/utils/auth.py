from graphql import GraphQLError

def require_user(info):
    user = getattr(info.context, "user", None)
    if not user or not getattr(user, "is_authenticated", False):
        raise GraphQLError("Authentication required")
    return user
