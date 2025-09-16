import pytest
import json
from decimal import Decimal
from django.utils import timezone
from django.contrib.auth import get_user_model
from api.models import City, FlightBooking

User = get_user_model()


CREATE_FLIGHTflight_booking_MUTATION = """
mutation CreateFlightBooking(
    $departureCityId: ID!,
    $destinationCityId: ID!,
    $departureAirport: String!,
    $destinationAirport: String!,
    $departureDateTime: DateTime!,
    $arrivalDateTime: DateTime!,
    $flightDuration: Decimal!,
    $numberOfStops: Int!,
    $numberOfPassengers: Int!,
    $totalPrice: Decimal!
) {
    createFlightBooking(
        departureCityId: $departureCityId,
        destinationCityId: $destinationCityId,
        departureAirport: $departureAirport,
        destinationAirport: $destinationAirport,
        departureDateTime: $departureDateTime,
        arrivalDateTime: $arrivalDateTime,
        flightDuration: $flightDuration,
        numberOfStops: $numberOfStops,
        numberOfPassengers: $numberOfPassengers,
        totalPrice: $totalPrice
    ) {
        success
        errors
        flightBooking {
            id
            departureAirport
            destinationAirport
            totalPrice
        }
    }
}
"""

@pytest.mark.django_db
def test_create_flight(client):
    user = User.objects.create_user(username="user1", password="pass123")
    client.force_login(user)

    departure_city = City.objects.create(city="City A")
    destination_city = City.objects.create(city="City B")

    variables = {
        "departureCityId": str(departure_city.id),
        "destinationCityId": str(destination_city.id),
        "departureAirport": "Airport A",
        "destinationAirport": "Airport B",
        "departureDateTime": timezone.now().isoformat(),
        "arrivalDateTime": (timezone.now() + timezone.timedelta(hours=2)).isoformat(),
        "flightDuration": "2.00",
        "numberOfStops": 0,
        "numberOfPassengers": 1,
        "totalPrice": "150.00",
    }

    response = client.post(
        "/graphql/",
        data={"query": CREATE_FLIGHTflight_booking_MUTATION, "variables": variables},
        content_type="application/json"
    )

    content = json.loads(response.content)
    assert "errors" not in content

    data = content["data"]["createFlightBooking"]
    assert data["success"] is True
    assert data["errors"] == []

    flight_data = data["flightBooking"]
    assert flight_data["departureAirport"] == "Airport A"
    assert flight_data["destinationAirport"] == "Airport B"
    assert float(flight_data["totalPrice"]) == 150.00

    flight_booking = FlightBooking.objects.get(pk=flight_data["id"])
    assert flight_booking.user == user
    assert flight_booking.departure_city == departure_city
    assert flight_booking.destination_city == destination_city
    assert flight_booking.total_price == Decimal("150.00")


UPDATE_FLIGHTflight_booking_MUTATION = """
mutation UpdateFlightBooking($id: ID!, $numberOfPassengers: Int!, $totalPrice: Decimal!) {
    updateFlightBooking(id: $id, numberOfPassengers: $numberOfPassengers, totalPrice: $totalPrice) {
        success
        errors
        flightBooking {
            id
            numberOfPassengers
            totalPrice
        }
    }
}
"""

@pytest.mark.django_db
def test_update_flight(client):
    user = User.objects.create_user(username="user1", password="pass123")
    client.force_login(user)

    departure_city = City.objects.create(city="City A")
    destination_city = City.objects.create(city="City B")

    flight_booking = FlightBooking.objects.create(
        user=user,
        departure_city=departure_city,
        destination_city=destination_city,
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
        "id": str(flight_booking.id),
        "numberOfPassengers": 4,
        "totalPrice": Decimal("400.00")
    }

    response = client.post(
        "/graphql/",
        data={"query": UPDATE_FLIGHTflight_booking_MUTATION, "variables": variables},
        content_type="application/json"
    )

    content = json.loads(response.content)
    assert "errors" not in content

    data = content["data"]["updateFlightBooking"]
    assert data["success"] is True
    assert data["errors"] == []
    assert data["flightBooking"]["numberOfPassengers"] == 4
    assert float(data["flightBooking"]["totalPrice"]) == 400.00

    flight_booking.refresh_from_db()
    assert flight_booking.number_of_passengers == 4
    assert flight_booking.total_price == Decimal("400.00")
    
    
DELETE_FLIGHT_BOOKING_MUTATION = """
mutation DeleteFlightBooking($id: ID!) {
    deleteFlightBooking(id: $id) {
        success
        errors
    }
}
"""

@pytest.mark.django_db
def test_delete_flight_booking(client):
    user = User.objects.create_user(username="user1", password="pass123")
    client.force_login(user)

    departure_city = City.objects.create(city="City A")
    destination_city = City.objects.create(city="City B")

    flight_booking = FlightBooking.objects.create(
        user=user,
        departure_city=departure_city,
        destination_city=destination_city,
        departure_airport="Airport A",
        destination_airport="Airport B",
        departure_date_time=timezone.now(),
        arrival_date_time=timezone.now() + timezone.timedelta(hours=2),
        flight_duration=Decimal("2.00"),
        number_of_stops=0,
        number_of_passengers=1,
        total_price=Decimal("100.00"),
    )

    variables = {"id": str(flight_booking.id)}

    response = client.post(
        "/graphql/",
        data={"query": DELETE_FLIGHT_BOOKING_MUTATION, "variables": variables},
        content_type="application/json"
    )

    content = json.loads(response.content)
    assert "errors" not in content

    data = content["data"]["deleteFlightBooking"]
    assert data["success"] is True
    assert data["errors"] == []

    with pytest.raises(FlightBooking.DoesNotExist):
        FlightBooking.objects.get(pk=flight_booking.id)