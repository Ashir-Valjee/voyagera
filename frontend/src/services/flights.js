import client from "../gql/client";
import { AMADEUS_FLIGHT_OFFERS } from "./gql/flights";

//  * params:
//  *   origin, destination, departureDate, returnDate?, adults?, nonStop?, maxResults?, currency?

export async function searchFlights(params) {
  const variables = {
    ...params,
    returnDate: params.returnDate || null,
  };

  const { data } = await client.query({
    query: AMADEUS_FLIGHT_OFFERS,
    variables,
    fetchPolicy: "no-cache",
  });

  return data?.amadeusFlightOffers ?? [];
}
