import pytest
import json
from decimal import Decimal
from django.utils import timezone
from django.contrib.auth import get_user_model
from api.models import City, FlightBooking, ActivityBooking

User = get_user_model()

CREATE_ACTIVITY_BOOKING_MUTATION = """
mutation CreateActivityBooking(
    $activityDateTime: DateTime!,
    $locationCityId: ID!,
    $numberOfPeople: Int!,
    $category: String!,
    $activityName: String!,
    $activityUrl: String!,
    $totalPrice: Decimal!,
    $flightBookingId: ID!,
    $imageUrl: String!
) {
    createActivityBooking(
        activityDateTime: $activityDateTime,
        locationCityId: $locationCityId,
        numberOfPeople: $numberOfPeople,
        category: $category,
        activityName: $activityName,
        activityUrl: $activityUrl,
        totalPrice: $totalPrice,
        flightBookingId: $flightBookingId,
        imageUrl: $imageUrl
    ) {
        success
        errors
        activityBooking {
            id
            activityName
            totalPrice
        }
    }
}
"""

@pytest.mark.django_db
def test_create_activity_booking(client):
    # 1. Create user and authenticate
    user = User.objects.create_user(username="user1", password="pass123")
    
    client.force_login(user)

    # 2. Create required cities
    flight_city = City.objects.create(city="Flight City")
    activity_city = City.objects.create(city="Activity City")

    # 3. Create a flight_booking booking
    flight_booking = FlightBooking.objects.create(
        user=user,
        departure_city=flight_city,
        destination_city=flight_city,
        departure_airport="Airport A",
        destination_airport="Airport B",
        departure_date_time=timezone.now(),
        arrival_date_time=timezone.now() + timezone.timedelta(hours=2),
        flight_duration=Decimal("2.00"),
        number_of_stops=0,
        number_of_passengers=1,
        total_price=Decimal("100.00"),
    )

    variables = {
        "activityDateTime": (timezone.now() + timezone.timedelta(days=1)).isoformat(),
        "locationCityId": str(activity_city.id),
        "numberOfPeople": 2,
        "category": "Adventure",
        "activityName": "Zipline Tour",
        "activityUrl": "https://example.com/zipline",
        "totalPrice": Decimal("200.00"),
        "flightBookingId": str(flight_booking.id),
        "imageUrl": "https://example.com/image.jpg"
    }

    response = client.post(
        "/graphql/",
        data={"query": CREATE_ACTIVITY_BOOKING_MUTATION, "variables": variables},
        content_type="application/json"
    )

    content = json.loads(response.content)
    assert "errors" not in content
    data = content["data"]["createActivityBooking"]

    assert data["success"] is True
    assert data["errors"] == []
    assert data["activityBooking"]["activityName"] == "Zipline Tour"
    assert float(data["activityBooking"]["totalPrice"]) == 200.00

    # Verify in DB
    booking = ActivityBooking.objects.get(id=data["activityBooking"]["id"])
    assert booking.flight_booking == flight_booking
    assert booking.location_city == activity_city
    assert booking.number_of_people == 2



UPDATE_ACTIVITY_BOOKING_MUTATION = """
mutation UpdateActivityBooking($id: ID!, $numberOfPeople: Int!, $totalPrice: Decimal!) {
    updateActivityBooking(id: $id, numberOfPeople: $numberOfPeople, totalPrice: $totalPrice) {
        success
        errors
        activityBooking {
            id
            numberOfPeople
            totalPrice
        }
    }
}
"""

@pytest.mark.django_db
def test_update_activity_booking(client):
    user = User.objects.create_user(username="user1", password="pass123")
    client.force_login(user)

    city = City.objects.create(city="Test City")

    flight_booking = FlightBooking.objects.create(
        user=user,
        departure_city=city,
        destination_city=city,
        departure_airport="Airport A",
        destination_airport="Airport B",
        departure_date_time=timezone.now(),
        arrival_date_time=timezone.now() + timezone.timedelta(hours=2),
        flight_duration=Decimal("2.00"),
        number_of_stops=0,
        number_of_passengers=1,
        total_price=Decimal("100.00"),
    )

    activity_booking = ActivityBooking.objects.create(
        activity_date_time=timezone.now() + timezone.timedelta(days=1),
        location_city=city,
        number_of_people=2,
        category="Adventure",
        activity_name="Zipline Tour",
        activity_url="https://example.com/zipline",
        total_price=Decimal("200.00"),
        flight_booking=flight_booking,
        image_url="https://example.com/image.jpg"
    )

    variables = {
        "id": str(activity_booking.id),
        "numberOfPeople": 4,
        "totalPrice": Decimal("400.00")
    }

    response = client.post(
        "/graphql/",
        data={"query": UPDATE_ACTIVITY_BOOKING_MUTATION, "variables": variables},
        content_type="application/json"
    )

    content = json.loads(response.content)
    assert "errors" not in content

    data = content["data"]["updateActivityBooking"]
    assert data["success"] is True
    assert data["errors"] == []
    assert data["activityBooking"]["numberOfPeople"] == 4
    assert float(data["activityBooking"]["totalPrice"]) == 400.00

    activity_booking.refresh_from_db()
    assert activity_booking.number_of_people == 4
    assert activity_booking.total_price == Decimal("400.00")


DELETE_ACTIVITY_BOOKING_MUTATION = """
mutation DeleteActivityBooking($id: ID!) {
    deleteActivityBooking(id: $id) {
        success
        errors
    }
}
"""

@pytest.mark.django_db
def test_delete_activity_booking(client):
    user = User.objects.create_user(username="user1", password="pass123")
    client.force_login(user)

    city = City.objects.create(city="Test City")

    flight_booking = FlightBooking.objects.create(
        user=user,
        departure_city=city,
        destination_city=city,
        departure_airport="Airport A",
        destination_airport="Airport B",
        departure_date_time=timezone.now(),
        arrival_date_time=timezone.now() + timezone.timedelta(hours=2),
        flight_duration=Decimal("2.00"),
        number_of_stops=0,
        number_of_passengers=1,
        total_price=Decimal("100.00"),
    )

    activity_booking = ActivityBooking.objects.create(
        activity_date_time=timezone.now() + timezone.timedelta(days=1),
        location_city=city,
        number_of_people=2,
        category="Adventure",
        activity_name="Zipline Tour",
        activity_url="https://example.com/zipline",
        total_price=Decimal("200.00"),
        flight_booking=flight_booking,
        image_url="https://example.com/image.jpg"
    )

    variables = {"id": str(activity_booking.id)}

    response = client.post(
        "/graphql/",
        data={"query": DELETE_ACTIVITY_BOOKING_MUTATION, "variables": variables},
        content_type="application/json"
    )

    content = json.loads(response.content)
    assert "errors" not in content

    data = content["data"]["deleteActivityBooking"]
    assert data["success"] is True
    assert data["errors"] == []

    with pytest.raises(ActivityBooking.DoesNotExist):
        ActivityBooking.objects.get(pk=activity_booking.id)