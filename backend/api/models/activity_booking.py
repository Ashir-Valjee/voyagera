from django.conf import settings
from django.db import models
from .city import City
from .flight_booking import FlightBooking

class ActivityBooking(models.Model):
    class Meta:
        db_table = "activity_bookings"

    location_city = models.ForeignKey(
        City,
        on_delete= models.CASCADE,
        related_name="location_city"
    )

    flight_booking = models.ForeignKey(
        FlightBooking,
        on_delete=models.CASCADE,
        related_name="flight_booking"
    )

    date_created = models.DateTimeField(auto_now_add=True)

    activity_date_time = models.DateTimeField()

    number_of_people = models.PositiveIntegerField(default=1)

    category = models.CharField(max_length=255)

    activity_name = models.CharField(max_length=255)

    activity_url = models.CharField()

    total_price = models.DecimalField(decimal_places=2, max_digits=10)

    