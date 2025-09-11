import graphene
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password, make_password
from django.db import transaction
from api.models import Profile

from api.lib.token import (
    generate_access_token,
    generate_refresh_token,
    decode_refresh,
)

User = get_user_model()

class Register(graphene.Mutation):
    class Arguments:
        email = graphene.String(required=True)
        password = graphene.String(required=True)

    access = graphene.String()
    refresh = graphene.String()

    @transaction.atomic
    def mutate(self, info, email, password):
        email = email.strip().lower()
        if User.objects.filter(username=email).exists():
            raise Exception("Email already registered")
        user = User.objects.create(
            username=email,
            email=email,
            password=make_password(password),
        )
        # create a profile explicitly
        Profile.objects.get_or_create(user=user)

        return Register(
            access=generate_access_token(user.id, user.email),
            refresh=generate_refresh_token(user.id),
        )

class Login(graphene.Mutation):
    class Arguments:
        email = graphene.String(required=True)
        password = graphene.String(required=True)

    access = graphene.String()
    refresh = graphene.String()

    def mutate(self, info, email, password):
        email = email.strip().lower()
        user = User.objects.filter(username=email).first()
        if not user or not check_password(password, user.password):
            raise Exception("Invalid credentials")
        return Login(
            access=generate_access_token(user.id, user.email),
            refresh=generate_refresh_token(user.id),
        )

class RefreshToken(graphene.Mutation):
    class Arguments:
        refresh = graphene.String(required=True)

    access = graphene.String()

    def mutate(self, info, refresh):
        payload = decode_refresh(refresh)  # raises if invalid/expired
        uid = int(payload.get("sub") or payload.get("user_id") or 0)
        user = User.objects.filter(id=uid).first()
        if not user:
            raise Exception("User not found")
        return RefreshToken(access=generate_access_token(user.id, user.email))

class AuthMutations(graphene.ObjectType):
    register = Register.Field()
    login = Login.Field()
    refreshToken = RefreshToken.Field()
