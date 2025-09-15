import { apollo } from "../lib/apollo";
import { FlightBooking, FlightBookingById, CreateFlightBooking, DeleteFlightBooking, UpdateFlightBooking } from "./gql/flight_booking";


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
  flightDuration,
  numberOfPassengers,
  numberOfStops,
  totalPrice
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
      flightDuration,
      numberOfPassengers,
      numberOfStops,
      totalPrice,
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
