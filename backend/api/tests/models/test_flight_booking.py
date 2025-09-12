import pytest
from django.utils import timezone
from decimal import Decimal
from django.contrib.auth import get_user_model
from api.models import City, FlightBooking

User = get_user_model()

@pytest.mark.django_db
def test_flight_booking_creation():
    user = User.objects.create_user(username="testuser", password="password")
    london = City.objects.create(city="London", country="UK")
    paris = City.objects.create(city="Paris", country="France")

    booking = FlightBooking.objects.create(
        user=user,
        departure_city=london,
        destination_city=paris,
        departure_date_time=timezone.now(),
        arrival_date_time=timezone.now(),
        departure_airport="LHR",
        destination_airport="CDG",
        flight_duration=Decimal("1.50"),
        total_price=Decimal("199.99")
    )

    assert booking.user == user
    assert booking.departure_city.city == "London"
    
@pytest.mark.django_db
def test_flight_booking_defaults():
    user = User.objects.create_user(username="defaultuser", password="password")
    london = City.objects.create(city="London", country="UK")
    paris = City.objects.create(city="Paris", country="France")

    booking = FlightBooking.objects.create(
        user=user,
        departure_city=london,
        destination_city=paris,
        departure_date_time=timezone.now(),
        arrival_date_time=timezone.now(),
        departure_airport="LHR",
        destination_airport="CDG",
        flight_duration=1.5,
        total_price=100.00
    )

    assert booking.number_of_stops == 0
    assert booking.number_of_passengers == 1
    
@pytest.mark.django_db
def test_user_deletion_cascades_to_bookings():
    user = User.objects.create_user(username="todelete", password="password")
    london = City.objects.create(city="London", country="UK")
    paris = City.objects.create(city="Paris", country="France")
    FlightBooking.objects.create(
        user=user,
        departure_city=london,
        destination_city=paris,
        departure_date_time=timezone.now(),
        arrival_date_time=timezone.now(),
        departure_airport="LHR",
        destination_airport="CDG",
        flight_duration=1.5,
        total_price=100.00
    )
    assert FlightBooking.objects.count() == 1

    user.delete()

    assert FlightBooking.objects.count() == 0