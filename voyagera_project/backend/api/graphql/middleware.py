from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
import jwt
from api.lib.jwt_token import decode_access

class JWTAuthMiddleware:
    def resolve(self, next, root, info, **kwargs):
        request = info.context

        # Read from both places (important for some setups)
        auth = request.headers.get("Authorization") or request.META.get("HTTP_AUTHORIZATION", "")
        request.user = getattr(request, "user", AnonymousUser())

        # TEMP DEBUG (uncomment if needed):
        # print("AUTH HEADER =", auth)

        if auth.startswith("Bearer "):
            token = auth.split(" ", 1)[1].strip()
            try:
                payload = decode_access(token)
                uid = int(payload.get("sub") or payload.get("user_id") or 0)
                if uid:
                    User = get_user_model()
                    request.user = User.objects.filter(id=uid).first() or AnonymousUser()
            except jwt.InvalidTokenError:
                request.user = AnonymousUser()

        return next(root, info, **kwargs)
