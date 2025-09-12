import os
import requests

base_url = "https://app.ticketmaster.com/discovery/v2/events"
api_key = "GG1CRiIXOIGiCWDyY1qkxkX6dNjHOutc"

def search_ticketmaster_events(
        countryCode = "GB",
        city = None,
        startDateTime = None,
        endDateTime = None,
        classificationName = None,
        size = 20
        ):
    
    params = {
        "apikey": api_key,
        "countryCode": countryCode,
        "size": size

    }

    if city:
        params["city"] = city
    
    if startDateTime:
        params["startDateTime"] = startDateTime
    
    if endDateTime:
        params["endDateTime"] = endDateTime
    
    if classificationName:
        params["classificationName"] = classificationName
    
    response = requests.get(f"{base_url}.json", params=params)
    response.raise_for_status()
    data=response.json()
    return data.get("_embedded", {}).get("events", [])

print(search_ticketmaster_events())