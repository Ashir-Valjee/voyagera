from graphene_django import DjangoObjectType
from api.models import City

class CityType(DjangoObjectType):
    class Meta: 
        model = City
        fields = (
            "id",
            "city",
            "country",
            "iata_code",
        )