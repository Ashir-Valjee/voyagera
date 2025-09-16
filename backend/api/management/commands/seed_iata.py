from django.core.management.base import BaseCommand
from api.models import City

IATA = {
    ("United Kingdom", "London"): "LON",
    ("France", "Paris"): "PAR",
    ("United States", "New York"): "NYC",
    
}

class Command(BaseCommand):
    help = "Backfill IATA codes on City records"

    def handle(self, *args, **opts):
        updated = 0
        for (country, city), code in IATA.items():
            obj = City.objects.filter(country=country, city=city).first()
            if not obj:
                self.stdout.write(self.style.WARNING(f"Missing City: {city}, {country}"))
                continue
            obj.iata_code = code
            obj.save(update_fields=["iata_code"])
            updated += 1
        self.stdout.write(self.style.SUCCESS(f"Updated {updated} cities"))
