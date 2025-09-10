"""
JWT helpers and a decorator for protecting Django views.
"""
from datetime import datetime, timedelta, timezone
from functools import wraps

import jwt
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from django.http import JsonResponse

ALG = getattr(settings, "JWT_ALG", "HS256")

def _now():
    return datetime.now(timezone.utc)

def generate_access_token(user_id: int, user_email: str):
    now = _now()
    payload = {
        "typ": "access",
        "sub": str(user_id),
        "email": user_email,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=settings.JWT_ACCESS_MINUTES)).timestamp()),
    }
    return jwt.encode(payload, settings.JWT_ACCESS_SECRET, algorithm=ALG)

def generate_refresh_token(user_id: int):
    now = _now()
    payload = {
        "typ": "refresh",
        "sub": str(user_id),
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(days=settings.JWT_REFRESH_DAYS)).timestamp()),
    }
    return jwt.encode(payload, settings.JWT_REFRESH_SECRET, algorithm=ALG)

def decode_access(token: str):
    return jwt.decode(token, settings.JWT_ACCESS_SECRET, algorithms=[ALG])

def decode_refresh(token: str):
    return jwt.decode(token, settings.JWT_REFRESH_SECRET, algorithms=[ALG])

def token_required(view_func):
    """
    Decorator for Django views: expects Authorization: Bearer <access_token>
    Adds request.user_id and request.user (Django User or AnonymousUser).
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        auth = request.headers.get("Authorization") or request.META.get("HTTP_AUTHORIZATION")
        if not auth or not auth.startswith("Bearer "):
            return JsonResponse({"message": "auth error"}, status=401)

        token = auth.split(" ", 1)[1].strip()
        try:
            payload = decode_access(token)
            user_id = int(payload.get("sub") or 0)
            if not user_id:
                return JsonResponse({"message": "auth error"}, status=401)

            request.user_id = user_id
            User = get_user_model()
            request.user = User.objects.filter(id=user_id).first() or AnonymousUser()
            return view_func(request, *args, **kwargs)
        except jwt.ExpiredSignatureError:
            return JsonResponse({"message": "token expired"}, status=401)
        except jwt.InvalidTokenError:
            return JsonResponse({"message": "auth error"}, status=401)
    return wrapper
