# api/management/commands/seed.py
import random
from datetime import timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.db import transaction, connection

from faker import Faker

from api.models import City, Profile, FlightBooking, ActivityBooking


# Hard-coded IATA (city/metro where available; else primary airport)
# Keys must exactly match your CITY_DATA tuples.
CITY_TO_IATA = {
    # --- United States ---
    ("United States", "New York"): "NYC",
    ("United States", "Los Angeles"): "LAX",
    ("United States", "Chicago"): "CHI",
    ("United States", "Houston"): "HOU",
    ("United States", "Phoenix"): "PHX",
    ("United States", "Philadelphia"): "PHL",
    ("United States", "San Antonio"): "SAT",
    ("United States", "San Diego"): "SAN",
    ("United States", "Dallas"): "DFW",
    ("United States", "San Jose"): "SJC",
    ("United States", "Austin"): "AUS",
    ("United States", "Jacksonville"): "JAX",
    # ("United States", "Fort Worth"): "DFW",
    ("United States", "Columbus"): "CMH",
    ("United States", "Charlotte"): "CLT",
    ("United States", "San Francisco"): "SFO",
    ("United States", "Indianapolis"): "IND",
    ("United States", "Seattle"): "SEA",
    ("United States", "Denver"): "DEN",
    ("United States", "Washington"): "WAS",
    ("United States", "Boston"): "BOS",
    ("United States", "El Paso"): "ELP",
    ("United States", "Nashville"): "BNA",
    ("United States", "Detroit"): "DTW",
    ("United States", "Oklahoma City"): "OKC",
    ("United States", "Portland"): "PDX",
    ("United States", "Las Vegas"): "LAS",
    ("United States", "Memphis"): "MEM",
    ("United States", "Louisville"): "SDF",
    ("United States", "Baltimore"): "BWI",
    ("United States", "Milwaukee"): "MKE",
    ("United States", "Albuquerque"): "ABQ",
    ("United States", "Tucson"): "TUS",
    ("United States", "Fresno"): "FAT",
    ("United States", "Mesa"): "AZA",          # Phoenix–Mesa Gateway
    ("United States", "Sacramento"): "SMF",
    ("United States", "Atlanta"): "ATL",
    ("United States", "Kansas City"): "MCI",
    ("United States", "Colorado Springs"): "COS",
    ("United States", "Miami"): "MIA",
    ("United States", "Raleigh"): "RDU",       # Raleigh–Durham
    ("United States", "Omaha"): "OMA",
    ("United States", "Long Beach"): "LGB",
    ("United States", "Virginia Beach"): "ORF", # Norfolk serves VA Beach
    ("United States", "Oakland"): "OAK",
    ("United States", "Minneapolis"): "MSP",
    ("United States", "Tulsa"): "TUL",
    ("United States", "Tampa"): "TPA",
    # ("United States", "Arlington"): "DFW",     # Arlington, TX (DFW)
    ("United States", "New Orleans"): "MSY",
    ("United States", "Wichita"): "ICT",
    ("United States", "Cleveland"): "CLE",
    ("United States", "Bakersfield"): "BFL",
    # ("United States", "Aurora"): "DEN",        # Aurora, CO (DEN)
    ("United States", "Anaheim"): "SNA",       # John Wayne/Orange County
    ("United States", "Honolulu"): "HNL",
    # ("United States", "Santa Ana"): "SNA",
    ("United States", "Riverside"): "ONT",     # Ontario, CA
    ("United States", "Corpus Christi"): "CRP",
    ("United States", "Lexington"): "LEX",

    # --- Canada ---
    ("Canada", "Toronto"): "YTO",    # metro (YYZ/YTZ/YKZ)
    ("Canada", "Vancouver"): "YVR",
    ("Canada", "Montreal"): "YMQ",   # metro (YUL/YHU/YMX)
    ("Canada", "Calgary"): "YYC",
    ("Canada", "Ottawa"): "YOW",

    # --- Mexico ---
    ("Mexico", "Mexico City"): "MEX",
    ("Mexico", "Guadalajara"): "GDL",
    ("Mexico", "Monterrey"): "MTY",
    ("Mexico", "Tijuana"): "TIJ",
    ("Mexico", "Cancún"): "CUN",

    # --- United Kingdom & Ireland ---
    ("United Kingdom", "London"): "LON",   # metro (LHR/LGW/LCY/LTN/STN/SEN)
    ("United Kingdom", "Manchester"): "MAN",
    ("United Kingdom", "Birmingham"): "BHX",
    ("United Kingdom", "Glasgow"): "GLA",
    ("United Kingdom", "Edinburgh"): "EDI",
    ("Ireland", "Dublin"): "DUB",

    # --- France ---
    ("France", "Paris"): "PAR",      # metro (CDG/ORY/BVA)
    ("France", "Lyon"): "LYS",
    ("France", "Marseille"): "MRS",
    ("France", "Nice"): "NCE",

    # --- Germany ---
    ("Germany", "Berlin"): "BER",
    ("Germany", "Munich"): "MUC",
    ("Germany", "Frankfurt"): "FRA",
    ("Germany", "Hamburg"): "HAM",
    ("Germany", "Cologne"): "CGN",

    # --- Benelux & CH/AT ---
    ("Netherlands", "Amsterdam"): "AMS",
    ("Netherlands", "Rotterdam"): "RTM",
    ("Belgium", "Brussels"): "BRU",
    ("Belgium", "Antwerp"): "ANR",
    ("Switzerland", "Zurich"): "ZRH",
    ("Switzerland", "Geneva"): "GVA",
    ("Austria", "Vienna"): "VIE",
    ("Austria", "Salzburg"): "SZG",

    # --- Spain & Portugal ---
    ("Spain", "Madrid"): "MAD",
    ("Spain", "Barcelona"): "BCN",
    ("Spain", "Valencia"): "VLC",
    ("Spain", "Seville"): "SVQ",
    ("Portugal", "Lisbon"): "LIS",
    ("Portugal", "Porto"): "OPO",

    # --- Italy ---
    ("Italy", "Rome"): "ROM",        # metro (FCO/CIA)
    ("Italy", "Milan"): "MIL",       # metro (MXP/LIN/BER)
    ("Italy", "Venice"): "VCE",
    ("Italy", "Florence"): "FLR",
    ("Italy", "Naples"): "NAP",

    # --- Greece / Turkey / Balkans / CEE ---
    ("Greece", "Athens"): "ATH",
    ("Greece", "Thessaloniki"): "SKG",
    ("Turkey", "Istanbul"): "IST",   # metro; SAW secondary
    ("Turkey", "Ankara"): "ESB",
    ("Romania", "Bucharest"): "BUH", # metro (OTP/BBU)
    ("Bulgaria", "Sofia"): "SOF",
    ("Hungary", "Budapest"): "BUD",
    ("Czechia", "Prague"): "PRG",
    ("Poland", "Warsaw"): "WAW",
    ("Poland", "Krakow"): "KRK",
    ("Poland", "Gdansk"): "GDN",
    ("Denmark", "Copenhagen"): "CPH",
    ("Sweden", "Stockholm"): "STO",  # metro (ARN/BMA)
    ("Sweden", "Gothenburg"): "GOT",
    ("Norway", "Oslo"): "OSL",
    ("Finland", "Helsinki"): "HEL",
    ("Iceland", "Reykjavik"): "REK", # metro (KEF/RKV)
    ("Estonia", "Tallinn"): "TLL",
    ("Latvia", "Riga"): "RIX",
    ("Lithuania", "Vilnius"): "VNO",
    ("Croatia", "Zagreb"): "ZAG",
    ("Slovenia", "Ljubljana"): "LJU",
    ("Slovakia", "Bratislava"): "BTS",
    ("Bosnia and Herzegovina", "Sarajevo"): "SJJ",
    ("Serbia", "Belgrade"): "BEG",
    ("North Macedonia", "Skopje"): "SKP",
    ("Albania", "Tirana"): "TIA",
    ("Montenegro", "Podgorica"): "TGD",
    ("Kosovo", "Pristina"): "PRN",
    ("Moldova", "Chisinau"): "RMO",  # (formerly KIV)
    ("Ukraine", "Kyiv"): "IEV",      # (KBP/IEV; city code commonly IEV)
    ("Ukraine", "Lviv"): "LWO",
    ("Ukraine", "Odessa"): "ODS",
    ("Belarus", "Minsk"): "MSQ",
    ("Russia", "Moscow"): "MOW",     # metro (SVO/DME/VKO)
    ("Russia", "St Petersburg"): "LED",

    # --- Middle East / North Africa ---
    ("Qatar", "Doha"): "DOH",
    ("United Arab Emirates", "Dubai"): "DXB",
    ("United Arab Emirates", "Abu Dhabi"): "AUH",
    ("Saudi Arabia", "Riyadh"): "RUH",
    ("Saudi Arabia", "Jeddah"): "JED",
    ("Oman", "Muscat"): "MCT",
    ("Kuwait", "Kuwait City"): "KWI",
    ("Bahrain", "Manama"): "BAH",
    ("Israel", "Tel Aviv"): "TLV",
    ("Jordan", "Amman"): "AMM",
    ("Lebanon", "Beirut"): "BEY",
    ("Egypt", "Cairo"): "CAI",
    ("Egypt", "Alexandria"): "HBE",  # Borg El Arab
    ("Morocco", "Casablanca"): "CMN",
    ("Morocco", "Marrakesh"): "RAK",
    ("Tunisia", "Tunis"): "TUN",
    ("Algeria", "Algiers"): "ALG",

    # --- Sub-Saharan Africa ---
    ("Kenya", "Nairobi"): "NBO",
    ("Kenya", "Mombasa"): "MBA",
    ("Ethiopia", "Addis Ababa"): "ADD",
    ("Ghana", "Accra"): "ACC",
    ("Nigeria", "Lagos"): "LOS",
    ("Nigeria", "Abuja"): "ABV",
    ("Senegal", "Dakar"): "DSS",
    ("South Africa", "Johannesburg"): "JNB",
    ("South Africa", "Cape Town"): "CPT",
    ("South Africa", "Durban"): "DUR",
    ("Zimbabwe", "Harare"): "HRE",
    ("Mozambique", "Maputo"): "MPM",
    ("Angola", "Luanda"): "LAD",
    ("Botswana", "Gaborone"): "GBE",
    ("Namibia", "Windhoek"): "WDH",
    ("Madagascar", "Antananarivo"): "TNR",

    # --- South Asia / SEA / East Asia / Oceania ---
    ("India", "New Delhi"): "DEL",
    ("India", "Mumbai"): "BOM",
    ("India", "Bengaluru"): "BLR",
    ("India", "Chennai"): "MAA",
    ("India", "Hyderabad"): "HYD",
    ("India", "Kolkata"): "CCU",
    ("India", "Ahmedabad"): "AMD",
    ("India", "Pune"): "PNQ",
    ("Pakistan", "Karachi"): "KHI",
    ("Pakistan", "Lahore"): "LHE",
    ("Pakistan", "Islamabad"): "ISB",
    ("Bangladesh", "Dhaka"): "DAC",
    ("Sri Lanka", "Colombo"): "CMB",
    ("Nepal", "Kathmandu"): "KTM",
    ("Thailand", "Bangkok"): "BKK",    # metro (BKK/DMK)
    ("Thailand", "Phuket"): "HKT",
    ("Thailand", "Chiang Mai"): "CNX",
    ("Vietnam", "Hanoi"): "HAN",
    ("Vietnam", "Ho Chi Minh City"): "SGN",
    ("Vietnam", "Da Nang"): "DAD",
    ("Malaysia", "Kuala Lumpur"): "KUL",
    ("Malaysia", "George Town"): "PEN", # Penang
    ("Singapore", "Singapore"): "SIN",
    ("Indonesia", "Jakarta"): "JKT",    # metro (CGK/HLP)
    ("Indonesia", "Surabaya"): "SUB",
    ("Indonesia", "Denpasar"): "DPS",
    ("Philippines", "Manila"): "MNL",
    ("Philippines", "Cebu"): "CEB",
    ("Japan", "Tokyo"): "TYO",          # metro (HND/NRT)
    ("Japan", "Osaka"): "OSA",          # metro (KIX/ITM/UKB)
    ("Japan", "Kyoto"): "KIX",          # nearest major (no big commercial airport in Kyoto)
    ("Japan", "Sapporo"): "SPK",        # metro (CTS/OKD)
    ("South Korea", "Seoul"): "SEL",    # metro (ICN/GMP)
    ("South Korea", "Busan"): "PUS",
    ("Hong Kong", "Hong Kong"): "HKG",
    ("Taiwan", "Taipei"): "TPE",
    ("Taiwan", "Taichung"): "RMQ",
    ("Australia", "Sydney"): "SYD",
    ("Australia", "Melbourne"): "MEL",
    ("Australia", "Brisbane"): "BNE",
    ("Australia", "Perth"): "PER",
    ("Australia", "Adelaide"): "ADL",
    ("New Zealand", "Auckland"): "AKL",
    ("New Zealand", "Wellington"): "WLG",
    ("New Zealand", "Christchurch"): "CHC",
}


# ----------------------------
# IATA backfill dictionary (extend as needed)
# ----------------------------
IATA = {
    ("United Kingdom", "London"): "LON",
    ("France", "Paris"): "PAR",
    ("United States", "New York"): "NYC",
}

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
    "kosovo": "XK",
    "moldova": "MD",
    "ukraine": "UA",
    "belarus": "BY",
    "russia": "RU",
    # MENA
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
    # Asia / Oceania
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
    letters = "".join(ch for ch in city_obj.city if ch.isalpha())
    return (letters[:3] or "XXX").upper()


def _rand_bool(p_true=0.5) -> bool:
    return random.random() < p_true


def truncate_and_restart(*models, keep_cities: bool = False):
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


def backfill_iata_codes(cmd):
    updated = 0
    for (country, city), code in IATA.items():
        obj = City.objects.filter(country=country, city=city).first()
        if not obj:
            cmd.stdout.write(cmd.style.WARNING(f"Missing City: {city}, {country}"))
            continue
        if obj.iata_code != code:
            obj.iata_code = code
            obj.save(update_fields=["iata_code"])
            updated += 1
    cmd.stdout.write(cmd.style.SUCCESS(f"IATA backfill complete. Updated {updated} cities."))


class Command(BaseCommand):
    help = "Seed the database and/or backfill IATA codes."

    def add_arguments(self, parser):
        parser.add_argument("--fresh", action="store_true",
                            help="Truncate seed tables and reset IDs before seeding.")
        parser.add_argument("--reset-users", action="store_true",
                            help="Also TRUNCATE auth_user (resets user IDs).")
        parser.add_argument("--users", type=int, default=10,
                            help="How many users to create (default: 10)")
        parser.add_argument("--bookings-per-user", type=int, default=3,
                            help="How many flight bookings per user (default: 3)")
        parser.add_argument("--activities-per-booking", type=int, default=2,
                            help="How many activity bookings per flight booking (default: 2)")
        parser.add_argument("--keep-cities", action="store_true",
                            help="Keep existing cities when using --fresh.")
        # IATA-only / skip
        parser.add_argument("--iata-only", action="store_true",
                            help="Only backfill IATA codes and exit.")
        parser.add_argument("--skip-iata", action="store_true",
                            help="Skip IATA backfill step after seeding.")

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
        iata_only = opts["iata_only"]
        skip_iata = opts["skip_iata"]

        if iata_only:
            self.stdout.write("Backfilling IATA codes only...")
            backfill_iata_codes(self)   # pass self, not self.stdout
            return

        self.stdout.write(self.style.SUCCESS("Seeding database..."))

        if fresh:
            self.stdout.write("Truncating seed tables and resetting identities...")
            models_to_truncate = [ActivityBooking, FlightBooking, Profile, City]
            if reset_users:
                models_to_truncate.append(User)
            truncate_and_restart(*models_to_truncate, keep_cities=keep_cities)
            self.stdout.write(self.style.SUCCESS("Tables truncated and sequences reset."))

        # Seed Cities (with country_code)
        self.stdout.write("Creating cities...")
        cities = []
        for city, country in CITY_DATA:
            cc = COUNTRY_NAME_TO_ISO2.get((country or "").strip().lower())
            obj, _ = City.objects.get_or_create(
                city=city,
                country=country,
                defaults={"country_code": cc},
            )
            code = CITY_TO_IATA.get((country, city))
            if code and obj.iata_code != code:
                obj.iata_code = code
                obj.save(update_fields=["iata_code"])
            if cc and obj.country_code != cc:
                obj.country_code = cc
                obj.save(update_fields=["country_code"])
            cities.append(obj)

        if not cities:
            self.stdout.write(self.style.WARNING("No cities created; check CITY_DATA."))
            return
        self.stdout.write(self.style.SUCCESS(f"Cities ready: {len(cities)}"))

        # Backfill IATA (unless skipped)
        if not skip_iata:
            self.stdout.write("Backfilling IATA codes...")
            backfill_iata_codes(self)

        # Users + Profiles
        self.stdout.write(f"Creating {users_count} users with profiles...")
        users = []
        for i in range(users_count):
            email = f"user{i+1:03d}@example.com"
            password = "Password123!"
            user = User.objects.filter(username=email).first()
            if not user:
                user = User.objects.create_user(username=email, email=email, password=password)
            users.append(user)

            home = random.choice(cities)
            profile, _ = Profile.objects.get_or_create(user=user)
            # If your model uses ImageField 'profile_pic', you can skip this URL assignment
            # or adapt to your actual schema.
            if hasattr(profile, "profile_pic_url"):
                profile.profile_pic_url = "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"
            profile.home_city = home
            profile.likes_music = _rand_bool()
            profile.likes_sports = _rand_bool()
            profile.likes_arts = _rand_bool()
            profile.likes_film = _rand_bool()
            profile.likes_family = _rand_bool()
            profile.save()

        self.stdout.write(self.style.SUCCESS(f"Users + profiles ready: {len(users)}"))

        # Flight Bookings
        self.stdout.write(f"Creating {bookings_per_user} flight bookings per user...")
        all_bookings = []
        for user in users:
            for _ in range(bookings_per_user):
                dep = random.choice(cities)
                dest_choices = [c for c in cities if c.id != dep.id]
                if not dest_choices:
                    continue
                dest = random.choice(dest_choices)

                depart_at = timezone.now() + timedelta(
                    days=random.randint(3, 120),
                    hours=random.randint(5, 20),
                )
                duration_hours = random.randint(2, 12)
                duration_minutes = random.choice([0, 15, 30, 45])
                arrival_at = depart_at + timedelta(hours=duration_hours, minutes=duration_minutes)

                dep_iata = dep.iata_code or iata_for(dep)
                dest_iata = dest.iata_code or iata_for(dest)

                fb = FlightBooking.objects.create(
                    user=user,
                    departure_city=dep,
                    destination_city=dest,
                    departure_airport=dep_iata,
                    destination_airport=dest_iata,
                    departure_date_time=depart_at,
                    arrival_date_time=arrival_at,
                    flight_duration=Decimal(str(round(duration_hours + duration_minutes / 60, 2))),
                    number_of_stops=random.choice([0, 0, 0, 1, 1, 2]),
                    number_of_passengers=random.randint(1, 3),
                    total_price=Decimal(str(round(random.uniform(60, 650), 2))),
                )
                all_bookings.append(fb)

        self.stdout.write(self.style.SUCCESS(f"Flight bookings created: {len(all_bookings)}"))

        # Activity Bookings
        self.stdout.write(f"Creating {activities_per_booking} activities per booking...")
        act_total = 0
        for fb in all_bookings:
            for _ in range(activities_per_booking):
                start_at = fb.arrival_date_time + timedelta(
                    days=random.randint(0, 5), hours=random.randint(9, 20)
                )
                cat = random.choice(CATEGORIES)
                act_name = Faker().sentence(nb_words=random.randint(2, 5)).rstrip(".")

                ActivityBooking.objects.create(
                    location_city=fb.destination_city,
                    flight_booking=fb,
                    activity_date_time=start_at,
                    number_of_people=random.randint(1, fb.number_of_passengers),
                    category=cat,
                    activity_name=act_name,
                    activity_url=f"https://example.com/activities/{cat.lower()}/{Faker().lexify(text='????????')}",
                    total_price=Decimal(str(round(random.uniform(10, 120), 2))),
                    # image_url can be left null/blank
                )
                act_total += 1

        self.stdout.write(self.style.SUCCESS(f"Activity bookings created: {act_total}"))
        self.stdout.write(self.style.SUCCESS("Seeding complete!"))
