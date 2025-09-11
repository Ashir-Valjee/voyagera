import pytest
from django.db import IntegrityError
from api.models import City

@pytest.mark.django_db
def test_city_creation_and_str():
    city = City.objects.create(city="London", country="United Kingdom")
    
    assert city.city == "London"
    assert city.country == "United Kingdom"
    assert str(city) == "London, United Kingdom"
    
@pytest.mark.django_db
def test_city_uniqueness_constraint():
    City.objects.create(city="Paris", country="France")
    
    with pytest.raises(IntegrityError):
        City.objects.create(city="Paris", country="France")