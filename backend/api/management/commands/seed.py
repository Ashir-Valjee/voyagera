import random
from datetime import timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.db import transaction, connection

from faker import Faker

from api.models import City, Profile, FlightBooking, ActivityBooking

# ----------------------------
# 200 cities (city, country)
# ----------------------------
CITY_DATA = [
    ("New York", "United States"),
    ("Los Angeles", "United States"),
    ("Chicago", "United States"),
    ("Houston", "United States"),
    ("Phoenix", "United States"),
    ("Philadelphia", "United States"),
    ("San Antonio", "United States"),
    ("San Diego", "United States"),
    ("Dallas", "United States"),
    ("San Jose", "United States"),
    ("Austin", "United States"),
    ("Jacksonville", "United States"),
    ("Fort Worth", "United States"),
    ("Columbus", "United States"),
    ("Charlotte", "United States"),
    ("San Francisco", "United States"),
    ("Indianapolis", "United States"),
    ("Seattle", "United States"),
    ("Denver", "United States"),
    ("Washington", "United States"),
    ("Boston", "United States"),
    ("El Paso", "United States"),
    ("Nashville", "United States"),
    ("Detroit", "United States"),
    ("Oklahoma City", "United States"),
    ("Portland", "United States"),
    ("Las Vegas", "United States"),
    ("Memphis", "United States"),
    ("Louisville", "United States"),
    ("Baltimore", "United States"),
    ("Milwaukee", "United States"),
    ("Albuquerque", "United States"),
    ("Tucson", "United States"),
    ("Fresno", "United States"),
    ("Mesa", "United States"),
    ("Sacramento", "United States"),
    ("Atlanta", "United States"),
    ("Kansas City", "United States"),
    ("Colorado Springs", "United States"),
    ("Miami", "United States"),
    ("Raleigh", "United States"),
    ("Omaha", "United States"),
    ("Long Beach", "United States"),
    ("Virginia Beach", "United States"),
    ("Oakland", "United States"),
    ("Minneapolis", "United States"),
    ("Tulsa", "United States"),
    ("Tampa", "United States"),
    ("Arlington", "United States"),
    ("New Orleans", "United States"),
    ("Wichita", "United States"),
    ("Cleveland", "United States"),
    ("Bakersfield", "United States"),
    ("Aurora", "United States"),
    ("Anaheim", "United States"),
    ("Honolulu", "United States"),
    ("Santa Ana", "United States"),
    ("Riverside", "United States"),
    ("Corpus Christi", "United States"),
    ("Lexington", "United States"),
    ("Toronto", "Canada"),
    ("Vancouver", "Canada"),
    ("Montreal", "Canada"),
    ("Calgary", "Canada"),
    ("Ottawa", "Canada"),
    ("Mexico City", "Mexico"),
    ("Guadalajara", "Mexico"),
    ("Monterrey", "Mexico"),
    ("Tijuana", "Mexico"),
    ("Cancún", "Mexico"),
    ("London", "United Kingdom"),
    ("Manchester", "United Kingdom"),
    ("Birmingham", "United Kingdom"),
    ("Glasgow", "United Kingdom"),
    ("Edinburgh", "United Kingdom"),
    ("Dublin", "Ireland"),
    ("Paris", "France"),
    ("Lyon", "France"),
    ("Marseille", "France"),
    ("Nice", "France"),
    ("Berlin", "Germany"),
    ("Munich", "Germany"),
    ("Frankfurt", "Germany"),
    ("Hamburg", "Germany"),
    ("Cologne", "Germany"),
    ("Amsterdam", "Netherlands"),
    ("Rotterdam", "Netherlands"),
    ("Brussels", "Belgium"),
    ("Antwerp", "Belgium"),
    ("Zurich", "Switzerland"),
    ("Geneva", "Switzerland"),
    ("Vienna", "Austria"),
    ("Salzburg", "Austria"),
    ("Madrid", "Spain"),
    ("Barcelona", "Spain"),
    ("Valencia", "Spain"),
    ("Seville", "Spain"),
    ("Lisbon", "Portugal"),
    ("Porto", "Portugal"),
    ("Rome", "Italy"),
    ("Milan", "Italy"),
    ("Venice", "Italy"),
    ("Florence", "Italy"),
    ("Naples", "Italy"),
    ("Athens", "Greece"),
    ("Thessaloniki", "Greece"),
    ("Istanbul", "Turkey"),
    ("Ankara", "Turkey"),
    ("Bucharest", "Romania"),
    ("Sofia", "Bulgaria"),
    ("Budapest", "Hungary"),
    ("Prague", "Czechia"),
    ("Warsaw", "Poland"),
    ("Krakow", "Poland"),
    ("Gdansk", "Poland"),
    ("Copenhagen", "Denmark"),
    ("Stockholm", "Sweden"),
    ("Gothenburg", "Sweden"),
    ("Oslo", "Norway"),
    ("Helsinki", "Finland"),
    ("Reykjavik", "Iceland"),
    ("Tallinn", "Estonia"),
    ("Riga", "Latvia"),
    ("Vilnius", "Lithuania"),
    ("Zagreb", "Croatia"),
    ("Ljubljana", "Slovenia"),
    ("Bratislava", "Slovakia"),
    ("Sarajevo", "Bosnia and Herzegovina"),
    ("Belgrade", "Serbia"),
    ("Skopje", "North Macedonia"),
    ("Tirana", "Albania"),
    ("Podgorica", "Montenegro"),
    ("Pristina", "Kosovo"),
    ("Chisinau", "Moldova"),
    ("Kyiv", "Ukraine"),
    ("Lviv", "Ukraine"),
    ("Odessa", "Ukraine"),
    ("Minsk", "Belarus"),
    ("Moscow", "Russia"),
    ("St Petersburg", "Russia"),
    ("Doha", "Qatar"),
    ("Dubai", "United Arab Emirates"),
    ("Abu Dhabi", "United Arab Emirates"),
    ("Riyadh", "Saudi Arabia"),
    ("Jeddah", "Saudi Arabia"),
    ("Muscat", "Oman"),
    ("Kuwait City", "Kuwait"),
    ("Manama", "Bahrain"),
    ("Tel Aviv", "Israel"),
    ("Amman", "Jordan"),
    ("Beirut", "Lebanon"),
    ("Cairo", "Egypt"),
    ("Alexandria", "Egypt"),
    ("Casablanca", "Morocco"),
    ("Marrakesh", "Morocco"),
    ("Tunis", "Tunisia"),
    ("Algiers", "Algeria"),
    ("Nairobi", "Kenya"),
    ("Mombasa", "Kenya"),
    ("Addis Ababa", "Ethiopia"),
    ("Accra", "Ghana"),
    ("Lagos", "Nigeria"),
    ("Abuja", "Nigeria"),
    ("Dakar", "Senegal"),
    ("Johannesburg", "South Africa"),
    ("Cape Town", "South Africa"),
    ("Durban", "South Africa"),
    ("Harare", "Zimbabwe"),
    ("Maputo", "Mozambique"),
    ("Luanda", "Angola"),
    ("Gaborone", "Botswana"),
    ("Windhoek", "Namibia"),
    ("Antananarivo", "Madagascar"),
    ("New Delhi", "India"),
    ("Mumbai", "India"),
    ("Bengaluru", "India"),
    ("Chennai", "India"),
    ("Hyderabad", "India"),
    ("Kolkata", "India"),
    ("Ahmedabad", "India"),
    ("Pune", "India"),
    ("Karachi", "Pakistan"),
    ("Lahore", "Pakistan"),
    ("Islamabad", "Pakistan"),
    ("Dhaka", "Bangladesh"),
    ("Colombo", "Sri Lanka"),
    ("Kathmandu", "Nepal"),
    ("Bangkok", "Thailand"),
    ("Phuket", "Thailand"),
    ("Chiang Mai", "Thailand"),
    ("Hanoi", "Vietnam"),
    ("Ho Chi Minh City", "Vietnam"),
    ("Da Nang", "Vietnam"),
    ("Kuala Lumpur", "Malaysia"),
    ("George Town", "Malaysia"),
    ("Singapore", "Singapore"),
    ("Jakarta", "Indonesia"),
    ("Surabaya", "Indonesia"),
    ("Denpasar", "Indonesia"),
    ("Manila", "Philippines"),
    ("Cebu", "Philippines"),
    ("Tokyo", "Japan"),
    ("Osaka", "Japan"),
    ("Kyoto", "Japan"),
    ("Sapporo", "Japan"),
    ("Seoul", "South Korea"),
    ("Busan", "South Korea"),
    ("Hong Kong", "Hong Kong"),
    ("Taipei", "Taiwan"),
    ("Taichung", "Taiwan"),
    ("Sydney", "Australia"),
    ("Melbourne", "Australia"),
    ("Brisbane", "Australia"),
    ("Perth", "Australia"),
    ("Adelaide", "Australia"),
    ("Auckland", "New Zealand"),
    ("Wellington", "New Zealand"),
    ("Christchurch", "New Zealand"),
]

COUNTRY_NAME_TO_ISO2 = {
    # Europe
    "united kingdom": "GB",
    "ireland": "IE",
    "france": "FR",
    "germany": "DE",
    "netherlands": "NL",
    "belgium": "BE",
    "switzerland": "CH",
    "austria": "AT",
    "spain": "ES",
    "portugal": "PT",
    "italy": "IT",
    "greece": "GR",
    "turkey": "TR",
    "romania": "RO",
    "bulgaria": "BG",
    "hungary": "HU",
    "czechia": "CZ",
    "poland": "PL",
    "denmark": "DK",
    "sweden": "SE",
    "norway": "NO",
    "finland": "FI",
    "iceland": "IS",
    "estonia": "EE",
    "latvia": "LV",
    "lithuania": "LT",
    "croatia": "HR",
    "slovenia": "SI",
    "slovakia": "SK",
    "bosnia and herzegovina": "BA",
    "serbia": "RS",
    "north macedonia": "MK",
    "albania": "AL",
    "montenegro": "ME",
    "kosovo": "XK",      # widely used, not official ISO but commonly accepted
    "moldova": "MD",
    "ukraine": "UA",
    "belarus": "BY",
    "russia": "RU",

    # Middle East / North Africa
    "qatar": "QA",
    "united arab emirates": "AE",
    "saudi arabia": "SA",
    "oman": "OM",
    "kuwait": "KW",
    "bahrain": "BH",
    "israel": "IL",
    "jordan": "JO",
    "lebanon": "LB",
    "egypt": "EG",
    "morocco": "MA",
    "tunisia": "TN",
    "algeria": "DZ",

    # Sub-Saharan Africa
    "kenya": "KE",
    "ethiopia": "ET",
    "ghana": "GH",
    "nigeria": "NG",
    "senegal": "SN",
    "south africa": "ZA",
    "zimbabwe": "ZW",
    "mozambique": "MZ",
    "angola": "AO",
    "botswana": "BW",
    "namibia": "NA",
    "madagascar": "MG",

    # Americas
    "united states": "US",
    "canada": "CA",
    "mexico": "MX",

    # South/West/Central Asia + SEA + Oceania
    "india": "IN",
    "pakistan": "PK",
    "bangladesh": "BD",
    "sri lanka": "LK",
    "nepal": "NP",
    "thailand": "TH",
    "vietnam": "VN",
    "malaysia": "MY",
    "singapore": "SG",
    "indonesia": "ID",
    "philippines": "PH",
    "japan": "JP",
    "south korea": "KR",
    "hong kong": "HK",
    "taiwan": "TW",
    "australia": "AU",
    "new zealand": "NZ",
}

CATEGORIES = ["MUSEUM", "FOOD", "SPORT", "FAMILY", "ARTS", "FILM"]


def iata_for(city_obj) -> str:
    """Derive a simple seed 'airport code' from the city name."""
    letters = "".join(ch for ch in city_obj.city if ch.isalpha())
    return (letters[:3] or "XXX").upper()


def _rand_bool(p_true=0.5) -> bool:
    return random.random() < p_true


def truncate_and_restart(*models, keep_cities: bool = False):
    """
    TRUNCATE TABLE ... RESTART IDENTITY CASCADE for the given models.
    If keep_cities is True, the City table is excluded from truncation.
    """
    tables = [m._meta.db_table for m in models]
    if keep_cities:
        city_table = City._meta.db_table
        tables = [t for t in tables if t != city_table]
    if not tables:
        return
    sql = "TRUNCATE TABLE {} RESTART IDENTITY CASCADE;".format(
        ", ".join([f'"{t}"' for t in tables])
    )
    with connection.cursor() as cur:
        cur.execute(sql)


class Command(BaseCommand):
    help = "Seed the database with Cities, Users, Profiles, FlightBookings, and ActivityBookings."

    def add_arguments(self, parser):
        parser.add_argument(
            "--fresh",
            action="store_true",
            help="Truncate seed tables and reset IDs before seeding.",
        )
        parser.add_argument(
            "--reset-users",
            action="store_true",
            help="Also TRUNCATE auth_user (resets user IDs).",
        )
        parser.add_argument("--users", type=int, default=10,
                            help="How many users to create (default: 10)")
        parser.add_argument("--bookings-per-user", type=int, default=3,
                            help="How many flight bookings per user (default: 3)")
        parser.add_argument("--activities-per-booking", type=int, default=2,
                            help="How many activity bookings per flight booking (default: 2)")
        parser.add_argument("--keep-cities", action="store_true",
                            help="Keep existing cities when using --fresh.")

    @transaction.atomic
    def handle(self, *args, **opts):
        fake = Faker()
        User = get_user_model()

        users_count = opts["users"]
        bookings_per_user = opts["bookings_per_user"]
        activities_per_booking = opts["activities_per_booking"]
        fresh = opts["fresh"]
        keep_cities = opts["keep_cities"]
        reset_users = opts["reset_users"]

        self.stdout.write(self.style.SUCCESS("Seeding database..."))

        # --------- Fresh start: truncate and reset identities ----------
        if fresh:
            self.stdout.write("Truncating seed tables and resetting identities...")
            models_to_truncate = [ActivityBooking, FlightBooking, Profile, City]
            if reset_users:
                models_to_truncate.append(User)  # this truncates auth_user too
            truncate_and_restart(*models_to_truncate, keep_cities=keep_cities)
            self.stdout.write(self.style.SUCCESS("Tables truncated and sequences reset."))

        # --------- Seed Cities ----------
        self.stdout.write("Creating cities...")
        cities = []
        for city, country in CITY_DATA:
            # look up ISO2 code from country name
            cc = COUNTRY_NAME_TO_ISO2.get((country or "").strip().lower())

            obj, created = City.objects.get_or_create(
                city=city,
                country=country,
                defaults={"country_code": cc},
            )

            # if city existed, backfill/repair country_code
            if cc and obj.country_code != cc:
                obj.country_code = cc
                obj.save(update_fields=["country_code"])

            # (optional) if you also want to auto-fill iata_code when empty:
            # if not obj.iata_code:
            #     obj.iata_code = (city[:3] or "XXX").upper()  # or a real mapping
            #     obj.save(update_fields=["iata_code"])

            cities.append(obj)

        if not cities:
            self.stdout.write(self.style.WARNING("No cities created; check CITY_DATA."))
            return
        self.stdout.write(self.style.SUCCESS(f"Cities ready: {len(cities)}"))

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
        self.stdout.write(f"Creating {bookings_per_user} flight bookings per user...")
        all_bookings = []
        for user in users:
            for _ in range(bookings_per_user):
                dep = random.choice(cities)
                dest_choices = [c for c in cities if c.id != dep.id]
                if not dest_choices:
                    continue
                dest = random.choice(dest_choices)

                # future times
                depart_at = timezone.now() + timedelta(days=random.randint(3, 120), hours=random.randint(5, 20))
                duration_hours = random.randint(2, 12)
                duration_minutes = random.choice([0, 15, 30, 45])
                arrival_at = depart_at + timedelta(hours=duration_hours, minutes=duration_minutes)

                dep_iata = iata_for(dep)
                dest_iata = iata_for(dest)

                fb = FlightBooking.objects.create(
                    user=user,
                    departure_city=dep,
                    destination_city=dest,
                    departure_airport=dep_iata,       # CharField
                    destination_airport=dest_iata,    # CharField
                    departure_date_time=depart_at,
                    arrival_date_time=arrival_at,
                    flight_duration=Decimal(str(round(duration_hours + duration_minutes / 60, 2))),
                    number_of_stops=random.choice([0, 0, 0, 1, 1, 2]),
                    number_of_passengers=random.randint(1, 3),
                    total_price=Decimal(str(round(random.uniform(60, 650), 2))),
                )
                all_bookings.append(fb)

        self.stdout.write(self.style.SUCCESS(f"Flight bookings created: {len(all_bookings)}"))

        # --------- Create Activity Bookings ----------
        self.stdout.write(f"Creating {activities_per_booking} activities per booking...")
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
                    activity_url=f"https://example.com/activities/{cat.lower()}/{fake.lexify(text='????????')}",
                    total_price=Decimal(str(round(random.uniform(10, 120), 2))),
                )
                act_total += 1

        self.stdout.write(self.style.SUCCESS(f"Activity bookings created: {act_total}"))
        self.stdout.write(self.style.SUCCESS("Seeding complete!"))
