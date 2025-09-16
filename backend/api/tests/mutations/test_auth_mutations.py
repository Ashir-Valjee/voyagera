import pytest
import json
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from api.lib.jwt_token import generate_refresh_token, decode_refresh


User = get_user_model()

REGISTER_MUTATION = """
mutation Register($email: String!, $password: String!) {
    register(email: $email, password: $password) {
        access
        refresh
    }
}
"""

@pytest.mark.django_db
def test_register_user(client):
    email = "testuser@example.com"
    password = "strongpassword"

    response = client.post(
        "/graphql/",
        data={"query": REGISTER_MUTATION, "variables": {"email": email, "password": password}},
        content_type="application/json"
    )

    content = json.loads(response.content)
    
    assert "errors" not in content

    data = content["data"]["register"]
    
    assert data["access"] is not None
    assert data["refresh"] is not None

    user = User.objects.get(username=email)
    assert user.email == email
    assert user.profile is not None  

@pytest.mark.django_db
def test_register_existing_user(client):
    email = "existing@example.com"
    password = "password123"
    
    User.objects.create_user(username=email, email=email, password=password)

    response = client.post(
        "/graphql/",
        data={"query": REGISTER_MUTATION, "variables": {"email": email, "password": password}},
        content_type="application/json"
    )

    content = json.loads(response.content)

    assert "errors" in content
    assert content["errors"][0]["message"] == "Email already registered"
    
    
LOGIN_MUTATION = """
mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
        access
        refresh
    }
}
"""

@pytest.mark.django_db
def test_login_success(client):
    email = "testlogin@example.com"
    password = "securepassword"
    user = User.objects.create(
        username=email,
        email=email,
        password=make_password(password)
    )

    response = client.post(
        "/graphql/",
        data={"query": LOGIN_MUTATION, "variables": {"email": email, "password": password}},
        content_type="application/json"
    )

    content = json.loads(response.content)
    assert "errors" not in content

    data = content["data"]["login"]
    assert data["access"] is not None
    assert data["refresh"] is not None

@pytest.mark.django_db
def test_login_invalid_password(client):
    email = "wrongpass@example.com"
    password = "rightpassword"
    User.objects.create(
        username=email,
        email=email,
        password=make_password(password)
    )

    response = client.post(
        "/graphql/",
        data={"query": LOGIN_MUTATION, "variables": {"email": email, "password": "wrongpassword"}},
        content_type="application/json"
    )

    content = json.loads(response.content)
    assert "errors" in content
    assert content["errors"][0]["message"] == "Invalid credentials"

@pytest.mark.django_db
def test_login_nonexistent_user(client):
    response = client.post(
        "/graphql/",
        data={"query": LOGIN_MUTATION, "variables": {"email": "noone@example.com", "password": "pass"}},
        content_type="application/json"
    )

    content = json.loads(response.content)
    assert "errors" in content
    assert content["errors"][0]["message"] == "Invalid credentials"
    
    
REFRESH_TOKEN_MUTATION = """
mutation RefreshToken($refresh: String!) {
    refreshToken(refresh: $refresh) {
    access
    }
}
"""


@pytest.mark.django_db
def test_refresh_token(client): 
    user = User.objects.create_user(username="user1@test.com", password="pass123")
    
    refresh = generate_refresh_token(user.id)

    response = client.post(
        "/graphql/",
        data={
            "query": REFRESH_TOKEN_MUTATION,
            "variables": {"refresh": refresh},
        },
        content_type="application/json",
    )

    content = json.loads(response.content)
    assert "errors" not in content  

    data = content["data"]["refreshToken"]

    assert data["access"] is not None
    assert isinstance(data["access"], str)

    payload = decode_refresh(refresh)
    assert str(user.id) in data["access"] or user.email in data["access"]
