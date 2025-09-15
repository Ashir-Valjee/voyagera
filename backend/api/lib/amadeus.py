import os
import requests
from dotenv import load_dotenv

load_dotenv()

BASE = os.getenv("AMADEUS_BASE")
KEY = os.getenv("AMADEUS_KEY")
SECRET = os.getenv("AMADEUS_SECRET")

def get_access_token():
    r = requests.post(
            f"{BASE}/v1/security/oauth2/token",
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            data={
                "grant_type": "client_credentials",
                "client_id": KEY,
                "client_secret": SECRET,
            },
            timeout=15,
        )
    r.raise_for_status()
    return r.json()["access_token"]

def search_flight_offers(
    origin_code,            # e.g. "SYD"
    destination_code,       # e.g. "BKK"
    departure_date,         # "YYYY-MM-DD"
    return_date=None,      
    adults=1,
    non_stop=False,
    max_results=20,
    currency="GBP",
):
    token = get_access_token()
    params = {
        "originLocationCode": origin_code,
        "destinationLocationCode": destination_code,
        "departureDate": departure_date,
        "adults": adults,
        "nonStop": str(bool(non_stop)).lower(), 
        "max": max(1, min(int(max_results), 250)),
        "currencyCode": currency,
    }
    if return_date:
        params["returnDate"] = return_date

    r = requests.get(
        f"{BASE}/v2/shopping/flight-offers",
        params=params,
        headers={
            "Authorization": f"Bearer {token}",
            "accept": "application/vnd.amadeus+json",
        },
        timeout=30,
    )
    r.raise_for_status()
   
    return r.json().get("data", [])

# print(search_flight_offers(
#     origin_code="LON",
#     destination_code="PAR",
#     departure_date="2025-11-02",
#     return_date="2025-11-10",
#     max_results=2
# ))