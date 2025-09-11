import random
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.db import transaction

from faker import Faker

from api.models import City, Profile, FlightBooking, ActivityBooking


# ----------------------------
# Some sample cities + airports
# ----------------------------
CITY_DATA = [
    # city, country, dep_airport, dest_airport (IATA codes)
    ("London", "United Kingdom", "LHR", "LGW"),
    ("Manchester", "United Kingdom", "MAN", "MAN"),
    ("Edinburgh", "United Kingdom", "EDI", "EDI"),
    ("Barcelona", "Spain", "BCN", "BCN"),
    ("Madrid", "Spain", "MAD", "MAD"),
    ("Paris", "France", "CDG", "ORY"),
    ("Berlin", "Germany", "BER", "BER"),
    ("Rome", "Italy", "FCO", "CIA"),
    ("Amsterdam", "Netherlands", "AMS", "AMS"),
]

CATEGORIES = ["MUSEUM", "FOOD", "SPORT", "FAMILY", "ARTS", "FILM"]


def _rand_bool(p_true=0.5):
    return random.random() < p_true


class Command(BaseCommand):
    help = "Seed the database with Cities, Users, Profiles, FlightBookings, and ActivityBookings."

    def add_arguments(self, parser):
        parser.add_argument("--fresh", action="store_true",
                            help="Delete existing seed data before seeding.")
        parser.add_argument("--users", type=int, default=5,
                            help="How many users to create (default: 5)")
        parser.add_argument("--bookings-per-user", type=int, default=2,
                            help="How many flight bookings per user (default: 2)")
        parser.add_argument("--activities-per-booking", type=int, default=2,
                            help="How many activity bookings per flight booking (default: 2)")
        parser.add_argument("--keep-cities", action="store_true",
                            help="Keep existing cities (don’t delete) when using --fresh.")

    @transaction.atomic
    def handle(self, *args, **opts):
        fake = Faker()
        User = get_user_model()

        users_count = opts["users"]
        bookings_per_user = opts["bookings_per_user"]
        activities_per_booking = opts["activities_per_booking"]
        fresh = opts["fresh"]
        keep_cities = opts["keep_cities"]

        self.stdout.write(self.style.SUCCESS("Seeding database..."))

        # --------- Clear data if requested ----------
        if fresh:
            self.stdout.write("Clearing old data...")
            ActivityBooking.objects.all().delete()
            FlightBooking.objects.all().delete()
            Profile.objects.all().delete()
            # keep superusers; delete normal users
            User.objects.filter(is_superuser=False).delete()
            if not keep_cities:
                City.objects.all().delete()
            self.stdout.write(self.style.SUCCESS("Old data cleared."))

        # --------- Seed Cities ----------
        self.stdout.write("Creating cities...")
        cities = []
        for city, country, _, _ in CITY_DATA:
            obj, _ = City.objects.get_or_create(city=city, country=country)
            cities.append(obj)
        if not cities:
            self.stdout.write(self.style.WARNING("No cities created; check CITY_DATA."))
            return
        self.stdout.write(self.style.SUCCESS(f"Cities ready: {len(cities)}"))

        # Map city name → suggested airports
        iata_map = { (c, country): (dep, dest) for c, country, dep, dest in CITY_DATA }

        # --------- Create Users + Profiles ----------
        self.stdout.write(f"Creating {users_count} users with profiles...")
        users = []
        for i in range(users_count):
            email = f"user{i+1:03d}@example.com"
            password = "Password123!"  # test password
            if User.objects.filter(username=email).exists():
                user = User.objects.get(username=email)
            else:
                user = User.objects.create_user(username=email, email=email, password=password)
            users.append(user)

            # Create or update profile
            home = random.choice(cities)
            profile, _ = Profile.objects.get_or_create(user=user)
            profile.home_city = home
            profile.profile_pic_url = "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"
            profile.likes_music = _rand_bool()
            profile.likes_sports = _rand_bool()
            profile.likes_arts = _rand_bool()
            profile.likes_film = _rand_bool()
            profile.likes_family = _rand_bool()
            profile.save()

        self.stdout.write(self.style.SUCCESS(f"Users + profiles ready: {len(users)}"))

        # --------- Create Flight Bookings ----------
        self.stdout.write(
            f"Creating {bookings_per_user} flight bookings per user..."
        )
        all_bookings = []
        for user in users:
            for _ in range(bookings_per_user):
                dep = random.choice(cities)
                # ensure different destination
                dest = random.choice([c for c in cities if c.id != dep.id])

                # pick reasonable future times
                depart_at = timezone.now() + timedelta(days=random.randint(3, 90), hours=random.randint(5, 20))
                duration_hours = random.randint(2, 12)
                duration_minutes = random.choice([0, 15, 30, 45])
                arrival_at = depart_at + timedelta(hours=duration_hours, minutes=duration_minutes)

                # IATA codes (fallback to 3-letter slice if not found)
                dep_iata, dest_iata = iata_map.get((dep.city, dep.country), ("XXX", "YYY"))

                fb = FlightBooking.objects.create(
                    user=user,
                    departure_city=dep,
                    destination_city=dest,
                    departure_airport=dep_iata,
                    destination_airport=dest_iata,
                    departure_date_time=depart_at,
                    arrival_date_time=arrival_at,
                    flight_duration=round(duration_hours + duration_minutes / 60, 2),
                    number_of_stops=random.choice([0, 0, 0, 1, 1, 2]),  # skew to direct/1-stop
                    number_of_passengers=random.randint(1, 3),
                    total_price=round(random.uniform(60, 650), 2),
                )
                all_bookings.append(fb)

        self.stdout.write(self.style.SUCCESS(f"Flight bookings created: {len(all_bookings)}"))

        # --------- Create Activity Bookings ----------
        self.stdout.write(
            f"Creating {activities_per_booking} activities per booking..."
        )
        act_total = 0
        for fb in all_bookings:
            for _ in range(activities_per_booking):
                start_at = fb.arrival_date_time + timedelta(days=random.randint(0, 5), hours=random.randint(9, 20))
                cat = random.choice(CATEGORIES)
                act_name = fake.sentence(nb_words=random.randint(2, 5)).rstrip(".")

                ActivityBooking.objects.create(
                    location_city=fb.destination_city,
                    flight_booking=fb,
                    activity_date_time=start_at,
                    number_of_people=random.randint(1, fb.number_of_passengers),
                    category=cat,
                    activity_name=act_name,
                    # NOTE: your model has CharField for activity_url; ensure it has max_length in the model.
                    activity_url=f"https://example.com/activities/{cat.lower()}/{fake.lexify(text='????????')}",
                    total_price=round(random.uniform(10, 120), 2),
                )
                act_total += 1

        self.stdout.write(self.style.SUCCESS(f"Activity bookings created: {act_total}"))

        self.stdout.write(self.style.SUCCESS("Seeding complete!"))
