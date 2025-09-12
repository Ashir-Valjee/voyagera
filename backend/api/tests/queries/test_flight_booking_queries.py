import pytest
import json
from django.utils import timezone
from decimal import Decimal
from django.contrib.auth import get_user_model
from api.models import Profile, City, FlightBooking

User = get_user_model()

FLIGHTS_QUERY = """
    query {
        flightBookings {
            id
            departureAirport
        }
    }
"""

FLIGHT_BY_ID_QUERY = """
    query GetFlight($flightId: Int!) {
        flightBookingById(flightId: $flightId) {
            id
            departureAirport
        }
    }
"""

@pytest.fixture
def flight_data():
    user_a = User.objects.create_user(username="usera@test.com", password="password")
    user_b = User.objects.create_user(username="userb@test.com", password="password")
    
    city1 = City.objects.create(city="London", country="UK")
    city2 = City.objects.create(city="Paris", country="France")

    booking_a1 = FlightBooking.objects.create(
        user=user_a, departure_city=city1, destination_city=city2,
        departure_date_time=timezone.now(), arrival_date_time=timezone.now(),
        departure_airport="LHR", destination_airport="CDG",
        flight_duration=Decimal("1.50"), total_price=Decimal("199.99")
    )
    
    booking_b1 = FlightBooking.objects.create(
        user=user_b, departure_city=city2, destination_city=city1,
        departure_date_time=timezone.now(), arrival_date_time=timezone.now(),
        departure_airport="CDG", destination_airport="LHR",
        flight_duration=Decimal("1.50"), total_price=Decimal("150.00")
    )

    return {
        "user_a": user_a,
        "user_b": user_b,
        "booking_a1": booking_a1,
        "booking_b1": booking_b1,
    }

@pytest.mark.django_db
def test_get_own_flight_bookings(client, flight_data):
    client.force_login(flight_data["user_a"])
    response = client.post("/graphql/", {"query": FLIGHTS_QUERY}, content_type="application/json")
    content = json.loads(response.content)

    assert response.status_code == 200
    assert "errors" not in content
    assert len(content["data"]["flightBookings"]) == 1
    assert content["data"]["flightBookings"][0]["id"] == str(flight_data["booking_a1"].id)

@pytest.mark.django_db
def test_get_flight_bookings_unauthenticated(client):
    response = client.post("/graphql/", {"query": FLIGHTS_QUERY}, content_type="application/json")
    content = json.loads(response.content)

    assert response.status_code == 200
    assert "errors" in content
    assert "Authentication required" in content["errors"][0]["message"]

@pytest.mark.django_db
def test_get_flight_booking_by_id_success(client, flight_data):

    client.force_login(flight_data["user_a"])
    booking_id = flight_data["booking_a1"].id

    # Query for a booking owned by User A
    response = client.post(
        "/graphql/",
        {"query": FLIGHT_BY_ID_QUERY, "variables": {"flightId": booking_id}},
        content_type="application/json"
    )
    content = json.loads(response.content)

    assert response.status_code == 200
    assert "errors" not in content
    assert content["data"]["flightBookingById"]["id"] == str(booking_id)

@pytest.mark.django_db
def test_get_flight_booking_by_id_unauthorized(client, flight_data):
    client.force_login(flight_data["user_a"])
    booking_id_for_user_b = flight_data["booking_b1"].id

    response = client.post(
        "/graphql/",
        {"query": FLIGHT_BY_ID_QUERY, "variables": {"flightId": booking_id_for_user_b}},
        content_type="application/json"
    )
    content = json.loads(response.content)

    assert response.status_code == 200
    assert "errors" in content
    assert "FlightBooking matching query does not exist" in content["errors"][0]["message"]