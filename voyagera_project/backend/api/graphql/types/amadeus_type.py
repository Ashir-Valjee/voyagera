import graphene

class AmadeusType(graphene.ObjectType):
    id = graphene.ID()
    price_total = graphene.String()
    price_currency = graphene.String()


    out_departure_iata = graphene.String()
    out_departure_at = graphene.String()
    out_arrival_iata = graphene.String()
    out_arrival_at = graphene.String()
    out_carrier_code = graphene.String()
    out_flight_number = graphene.String()
    out_stops = graphene.Int()

 
    ret_departure_iata = graphene.String()
    ret_departure_at = graphene.String()
    ret_arrival_iata = graphene.String()
    ret_arrival_at = graphene.String()
    ret_carrier_code = graphene.String()
    ret_flight_number = graphene.String()
    ret_stops = graphene.Int()

    out_duration_iso = graphene.String()
    out_duration_minutes = graphene.Int()
    out_duration_hours = graphene.Float()

    ret_duration_iso = graphene.String()
    ret_duration_minutes = graphene.Int()
    ret_duration_hours = graphene.Float()

    total_duration_minutes = graphene.Int()
    total_duration_hours = graphene.Float()