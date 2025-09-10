from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
import jwt
from api.lib.token import decode_access  # implement decode_access(token) alongside your helpers

class JWTAuthMiddleware:
    def resolve(self, next, root, info, **kwargs):
        request = info.context
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth.split(" ", 1)[1].strip()
            try:
                payload = decode_access(token)  # validates and returns claims
                uid = int(payload.get("sub") or payload.get("user_id") or 0)
                if uid:
                    User = get_user_model()
                    request.user = User.objects.filter(id=uid).first() or AnonymousUser()
            except jwt.InvalidTokenError:
                request.user = AnonymousUser()
        return next(root, info, **kwargs)
