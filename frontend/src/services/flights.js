import { apollo } from "../lib/apollo";
import {
  AMADEUS_FLIGHT_OFFERS,
  CreateFlightBooking,
  UpdateFlightBooking,
  FlightBooking,
  FlightBookingById,
  DeleteFlightBooking,
} from "./gql/flights";

//  * params:
//  *   origin, destination, departureDate, returnDate?, adults?, nonStop?, maxResults?, currency?

export async function searchFlights(params) {
  const variables = {
    ...params,
    returnDate: params.returnDate || null,
  };

  const { data } = await apollo.query({
    query: AMADEUS_FLIGHT_OFFERS,
    variables,
    fetchPolicy: "no-cache",
  });

  return data?.amadeusFlightOffers ?? [];
}

export async function fetchFlightBookings() {
  const { data } = await apollo.query({
    query: FlightBooking,
    fetchPolicy: "network-only",
  });
  return data?.flightBookings ?? null;
}

export async function fetchFlightBookingById(flightId) {
  const { data } = await apollo.query({
    query: FlightBookingById,
    variables: { flightId },
    fetchPolicy: "network-only",
  });
  return data?.flightBookingById ?? null;
}

export async function createFlightBooking(
  arrivalDateTime,
  departureAirport,
  departureCityId,
  departureDateTime,
  destinationAirport,
  destinationCityId,
  flightDuration, // number or string
  numberOfPassengers,
  numberOfStops,
  totalPrice // number or string
) {
  const { data } = await apollo.mutate({
    mutation: CreateFlightBooking,
    variables: {
      arrivalDateTime,
      departureAirport,
      departureCityId,
      departureDateTime,
      destinationAirport,
      destinationCityId,
      flightDuration: String(flightDuration), // <-- ensure Decimal string
      numberOfPassengers,
      numberOfStops,
      totalPrice: String(totalPrice), // <-- ensure Decimal string
    },
  });
  return data?.createFlightBooking ?? null;
}

export async function updateFlightBooking(id, numberOfPassengers, totalPrice) {
  const { data } = await apollo.mutate({
    mutation: UpdateFlightBooking,
    variables: { id, numberOfPassengers, totalPrice },
  });
  return data?.updateFlightBooking ?? null;
}

export async function deleteFlightBooking(id) {
  const { data } = await apollo.mutate({
    mutation: DeleteFlightBooking,
    variables: { id },
  });
  return data?.deleteFlightBooking ?? null;
}
