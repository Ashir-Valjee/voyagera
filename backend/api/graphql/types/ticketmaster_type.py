import graphene

class TicketmasterType(graphene.ObjectType):

    id = graphene.String()
    name = graphene.String()
    city = graphene.String()
    classification_name = graphene.String()
    start_date_time = graphene.String()
    country = graphene.String()
    image_url = graphene.String()
    event_url = graphene.String()
    price_min = graphene.Float()
    price_max = graphene.Float()
    price_currency = graphene.String()