import pytest
import json
from django.contrib.auth import get_user_model
from api.models import Profile

User = get_user_model()

GET_PROFILE_QUERY = """
    query {
        getUserProfile {
            likesMusic
            homeCity {
                city
            }
            profilePicUrl
        }
    }
"""

@pytest.mark.django_db
def test_get_user_profile_defaults(client):
    # Create the user AND their profile by calling the register mutation.
    email = "test@user.com"
    password = "strongpassword"
    register_mutation = """
        mutation Register($email: String!, $password: String!) {
            register(email: $email, password: $password) {
                access
            }
        }
    """
    register_response = client.post(
        "/graphql/",
        {"query": register_mutation, "variables": {"email": email, "password": password}},
        content_type="application/json"
    )
    access_token = json.loads(register_response.content)["data"]["register"]["access"]

    headers = {"HTTP_AUTHORIZATION": f"Bearer {access_token}"}
    response = client.post(
        "/graphql/",
        {"query": GET_PROFILE_QUERY},
        content_type="application/json",
        **headers
    )
    
    content = json.loads(response.content)

    assert response.status_code == 200
    assert "errors" not in content
    profile_data = content["data"]["getUserProfile"]
    
    assert profile_data["likesMusic"] is False
    assert profile_data["homeCity"] is None
    assert "Portrait_Placeholder.png" in profile_data["profilePicUrl"]
    
@pytest.mark.django_db
def test_get_user_profile_unauthenticated(client):
    response = client.post(
        "/graphql/",
        {"query": GET_PROFILE_QUERY},
        content_type="application/json",
    )
    content = json.loads(response.content)

    assert response.status_code == 200
    assert "errors" in content
    assert content["errors"][0]["message"] == "Authentication required"
    assert content["data"]["getUserProfile"] is None