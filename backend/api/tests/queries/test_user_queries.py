import pytest
import json
from django.contrib.auth import get_user_model

User = get_user_model()

# This is the GraphQL query we will run in our tests
ME_QUERY = """
    query {
        me {
            id
            username
            email
        }
    }
"""

@pytest.mark.django_db
def test_me_query_authenticated(client):
    user = User.objects.create_user(username="testuser", password="password", email="test@user.com")
    client.force_login(user)

    response = client.post(
        "/graphql/", 
        json.dumps({"query": ME_QUERY}), 
        content_type="application/json"
    )

    content = json.loads(response.content)
    
    assert response.status_code == 200
    assert "errors" not in content
    assert content["data"]["me"]["username"] == user.username
    assert content["data"]["me"]["email"] == user.email


@pytest.mark.django_db
def test_me_query_unauthenticated(client):
    response = client.post(
        "/graphql/", 
        json.dumps({"query": ME_QUERY}), 
        content_type="application/json"
    )

    content = json.loads(response.content)
    
    # anonymous request succeeds (200 OK) but receives null data for the protected 'me' field.
    assert response.status_code == 200
    assert "errors" not in content
    assert content["data"]["me"] is None
