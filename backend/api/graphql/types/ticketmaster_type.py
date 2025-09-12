import graphene

class TicketmasterType(graphene.ObjectType):

    id = graphene.String()
    name = graphene.String()
    city = graphene.String()
