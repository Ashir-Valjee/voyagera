import pytest
import json
from django.contrib.auth import get_user_model
from api.models import Profile
from api.models import City
from decimal import Decimal

User = get_user_model()

UPDATE_PROFILE_MUTATION = """
mutation UpdateProfile(
    $firstName: String, 
    $lastName: String, 
    $likesMusic: Boolean, 
    $homeCityId: ID
) {
    updateProfile(
        firstName: $firstName, 
        lastName: $lastName, 
        likesMusic: $likesMusic, 
        homeCityId: $homeCityId
    ) {
        success
        errors
        profile {
            id
            firstName
            lastName
            likesMusic
            homeCity {
                id
                city
            }
        }
    }
}
"""

@pytest.mark.django_db
def test_update_profile_mutation(client):
    user = User.objects.create_user(username="user1", password="pass123")
    profile = Profile.objects.create(user=user)

    city = City.objects.create(city="Test City")

    client.force_login(user)

    variables = {
        "firstName": "Test",
        "lastName": "User",
        "likesMusic": True,
        "homeCityId": str(city.id)
    }

    response = client.post(
        "/graphql/",
        data={"query": UPDATE_PROFILE_MUTATION, "variables": variables},
        content_type="application/json"
    )

    content = json.loads(response.content)
    assert "errors" not in content

    data = content["data"]["updateProfile"]
    assert data["success"] is True
    assert data["errors"] in (None, [])

    updated_profile = data["profile"]
    assert updated_profile["firstName"] == "Test"
    assert updated_profile["lastName"] == "User"
    assert updated_profile["likesMusic"] is True
    assert updated_profile["homeCity"]["id"] == str(city.id)
    assert updated_profile["homeCity"]["city"] == "Test City"

    profile.refresh_from_db()
    assert profile.first_name == "Test"
    assert profile.last_name == "User"
    assert profile.likes_music is True
    assert profile.home_city == city
