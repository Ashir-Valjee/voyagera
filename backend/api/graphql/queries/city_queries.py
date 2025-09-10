import graphene
from graphene_django import DjangoObjectType
from ..types.city_type import CityType
from ...models.city import City

class CityQueries(graphene.ObjectType):
    cities = graphene.List(CityType)

    def resolve_cities(self,info):
        return City.objects.all()




# class Query(graphene.ObjectType):
#   """
#   Queries for the Restaurant model
#   """
#   restaurants = graphene.List(RestaurantType)

#   def resolve_restaurants(self, info, **kwargs):
#     return Restaurant.objects.all()