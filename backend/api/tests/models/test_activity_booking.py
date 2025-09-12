import pytest
from django.utils import timezone
from decimal import Decimal
from django.contrib.auth import get_user_model
from api.models import City, FlightBooking, ActivityBooking

User = get_user_model()

@pytest.fixture
def booking_setup():
    """
    A pytest fixture to create the necessary parent objects for tests.
    """
    user = User.objects.create_user(username="testuser", password="password")
    london = City.objects.create(city="London", country="UK")
    paris = City.objects.create(city="Paris", country="France")
    flight_booking = FlightBooking.objects.create(
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
    return {"user": user, "london": london, "paris": paris, "flight_booking": flight_booking}

@pytest.mark.django_db
def test_activity_booking_creation(booking_setup):
    flight_booking = booking_setup["flight_booking"]
    paris = booking_setup["paris"]

    activity = ActivityBooking.objects.create(
        flight_booking=flight_booking,
        location_city=paris,
        activity_date_time=timezone.now(),
        category="Tour",
        activity_name="Eiffel Tower Tour",
        activity_url="http://example.com",
        total_price=Decimal("50.00")
    )

    assert ActivityBooking.objects.count() == 1
    assert activity.flight_booking == flight_booking
    assert activity.location_city.city == "Paris"
    assert activity.activity_name == "Eiffel Tower Tour"
    
@pytest.mark.django_db
def test_activity_booking_defaults(booking_setup):
    flight_booking = booking_setup["flight_booking"]
    paris = booking_setup["paris"]

    activity = ActivityBooking.objects.create(
        flight_booking=flight_booking,
        location_city=paris,
        activity_date_time=timezone.now(),
        category="Tour",
        activity_name="Louvre Museum Visit",
        activity_url="http://example.com",
        total_price=Decimal("75.00")
    )

    assert activity.number_of_people == 1

@pytest.mark.django_db
def test_flight_booking_deletion_cascades(booking_setup):
    flight_booking = booking_setup["flight_booking"]
    paris = booking_setup["paris"]
    ActivityBooking.objects.create(
        flight_booking=flight_booking,
        location_city=paris,
        activity_date_time=timezone.now(),
        category="Tour",
        activity_name="Seine River Cruise",
        activity_url="http://example.com",
        total_price=Decimal("25.00")
    )
    assert ActivityBooking.objects.count() == 1

    flight_booking.delete()

    assert ActivityBooking.objects.count() == 0