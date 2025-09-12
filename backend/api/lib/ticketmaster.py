import os
import requests
from dotenv import load_dotenv

load_dotenv()

base_url = os.getenv("TICKETMASTER_BASE_URL")
api_key = os.getenv("TICKETMASTER_API_KEY")

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