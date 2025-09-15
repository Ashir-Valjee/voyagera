import json
import pytest
from django.contrib.auth import get_user_model
from api.models import FlightBooking, ActivityBooking, City
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

@pytest.mark.django_db
def test_activity_booking_by_flight_id_runs(client):
    user1 = User.objects.create_user(username="user1@test.com", password="password")
    client.force_login(user1)

    # Create cities
    departure_city = City.objects.create(city="DepCity", country="TestCountry")
    destination_city = City.objects.create(city="DestCity", country="TestCountry")

    # Create a flight booking
    flight_booking = FlightBooking.objects.create(
        user=user1,
        departure_city=departure_city,
        destination_city=destination_city,
        departure_airport="AAA",
        destination_airport="BBB",
        departure_date_time=timezone.now(),
        arrival_date_time=timezone.now() + timedelta(hours=2),
        flight_duration=2,
        number_of_stops=0,
        number_of_passengers=1,
        total_price=100,
    )

    # Create an activity booking
    activity_booking = ActivityBooking.objects.create(
        location_city=destination_city,
        flight_booking=flight_booking,
        activity_date_time=timezone.now() + timedelta(days=1),
        number_of_people=1,
        category="FOOD",
        activity_name="Test Dinner",
        activity_url="https://example.com",
        total_price=50,
    )

    variables = {"flightBookingId": flight_booking.id}

    query = '''
    query ActivityBookingByFlightId($flightBookingId: Int!) {
        activityBookingByFlightId(flightBookingId: $flightBookingId) {
            id
            activityDateTime
            numberOfPeople
            category
            activityName
            activityUrl
            totalPrice
        }
    }
    '''

    response = client.post(
        "/graphql/",
        data=json.dumps({"query": query, "variables": variables}),
        content_type="application/json",
    )

    content = json.loads(response.content)
    assert "errors" not in content
    assert "activityBookingByFlightId" in content["data"]
    
    
@pytest.mark.django_db
def test_sinle_activity_booking_queries(client):
    user1 = User.objects.create_user(username="user1@test.com", password="password")
    client.force_login(user1)
    
    departure_city = City.objects.create(city="DepCity", country="TestCountry")
    destination_city = City.objects.create(city="DestCity", country="TestCountry")
    
    flight_booking = FlightBooking.objects.create(
        user=user1,
        departure_city=departure_city,
        destination_city=destination_city,
        departure_airport="AAA",
        destination_airport="BBB",
        departure_date_time=timezone.now(),
        arrival_date_time=timezone.now() + timedelta(hours=2),
        flight_duration=2,
        number_of_stops=0,
        number_of_passengers=1,
        total_price=100,
    )
    
    activity_booking = ActivityBooking.objects.create(
        location_city=destination_city,
        flight_booking=flight_booking,
        activity_date_time=timezone.now() + timedelta(days=1),
        number_of_people=1,
        category="FOOD",
        activity_name="Test Dinner",
        activity_url="https://example.com",
        total_price=50,
    )
    
    query ='''
    query singleActivityBooking($id: Int!) {
        singleActivityBooking(id: $id) {
        id
        dateCreated
        activityDateTime
        numberOfPeople
        category
        activityName
        activityUrl
        totalPrice
    }
}
'''

    variables = {"id": activity_booking.id}
    
    response = client.post(
        "/graphql/",
        data=json.dumps({"query": query, "variables": variables}),
        content_type="application/json",
    )

    content = json.loads(response.content)
    assert "errors" not in content
    assert "singleActivityBooking" in content["data"]

@pytest.mark.django_db
def test_get_activity_bookings_by_user(client):
    user1 = User.objects.create_user(username="user1@test.com", password="password")
    client.force_login(user1)

    departure_city = City.objects.create(city="DepCity", country="TestCountry")
    destination_city = City.objects.create(city="DestCity", country="TestCountry")

    flight_booking = FlightBooking.objects.create(
        user=user1,
        departure_city=departure_city,
        destination_city=destination_city,
        departure_airport="AAA",
        destination_airport="BBB",
        departure_date_time=timezone.now(),
        arrival_date_time=timezone.now() + timedelta(hours=2),
        flight_duration=2,
        number_of_stops=0,
        number_of_passengers=1,
        total_price=100,
    )

    activity_booking = ActivityBooking.objects.create(
        location_city=destination_city,
        flight_booking=flight_booking,
        activity_date_time=timezone.now() + timedelta(days=1),
        number_of_people=1,
        category="FOOD",
        activity_name="Test Dinner",
        activity_url="https://example.com",
        total_price=50,
    )

    activity_booking_2 = ActivityBooking.objects.create(
        location_city=destination_city,
        flight_booking=flight_booking,
        activity_date_time=timezone.now() + timedelta(days=1),
        number_of_people=1,
        category="Family",
        activity_name="Frozen Movie",
        activity_url="https://example.com",
        total_price=60,
    )

    query ='''
    query ActivityBookingsByUser {
        activityBookingsByUser {
            id
            activityDateTime
            numberOfPeople
            category
            activityName
            activityUrl
            totalPrice
            flightBooking {
                id
                destinationCity {
                    id
                    country
                    city
                }
            }
        }
}
'''

    response = client.post(
        "/graphql/",
        data=json.dumps({"query": query}),
        content_type="application/json",
    )

    content = json.loads(response.content)

    activities = content["data"]["activityBookingsByUser"]

    assert "errors" not in content
    assert "activityBookingsByUser" in content["data"]
    assert activities[0]["flightBooking"]["destinationCity"]["city"] == "DestCity"
    assert len(activities) == 2
