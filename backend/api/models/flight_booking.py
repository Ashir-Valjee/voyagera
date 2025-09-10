from django.conf import settings
from django.db import models
from .city import City

class FlightBooking(models.Model):
    class Meta:
        db_table = "flight_bookings"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="flight_bookings"
    )

    departure_city = models.ForeignKey(
        City,
        on_delete=models.PROTECT,
        related_name="departure_city"
    )

    destination_city = models.ForeignKey(
        City,
        on_delete=models.PROTECT,
        related_name="destination_city"
    )

    depature_airport = models.CharField(max_length=255)

    destination_airport = models.CharField(max_length=255)

    date_created = models.DateTimeField(auto_now_add=True)

    depature_date_time = models.DateTimeField()

    arrival_date_time = models.DateTimeField()

    flight_duration = models.DecimalField(decimal_places=2, max_digits=10)

    number_of_stops = models.PositiveIntegerField(default=0)

    number_of_passengers = models.PositiveIntegerField(default=1)

    total_price = models.DecimalField(decimal_places=2, max_digits=10)

