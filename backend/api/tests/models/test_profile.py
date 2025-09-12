import pytest
from django.contrib.auth import get_user_model
from api.models import Profile, City

User = get_user_model()

@pytest.mark.django_db
def test_profile_creation_defaults():
    user = User.objects.create_user(username="defaultuser", password="password")

    profile = Profile.objects.create(user=user)

    assert profile.user == user
    assert profile.profile_pic_url == "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"
    assert profile.home_city is None
    assert profile.likes_music is False
    assert profile.likes_sports is False
    assert profile.created_at is not None
    assert profile.updated_at is not None


@pytest.mark.django_db
def test_profile_str_method():
    user = User.objects.create_user(username="struser", password="password")
    profile = Profile.objects.create(user=user)
    expected_string = f"Profile<{user.id}>"
    assert str(profile) == expected_string

@pytest.mark.django_db
def test_profile_with_home_city():
    user = User.objects.create_user(username="cityuser", password="password")
    london = City.objects.create(city="London", country="UK")

    profile = Profile.objects.create(user=user, home_city=london)

    assert profile.home_city == london
    assert profile.home_city.city == "London"