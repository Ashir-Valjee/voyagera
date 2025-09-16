import { apollo } from "../lib/apollo";
import {
  SingleActivityBooking,
  ActivityBookingsByFlight,
  CreateActivityBooking,
  DeleteActivityBooking,
  UpdateActivityBooking,
  TICKETMASTER_EVENTS,
  ActivityBookingsByUser,
} from "./gql/activity_booking";

export async function fetchSingleActivityBooking(id) {
  const { data } = await apollo.query({
    query: SingleActivityBooking,
    variables: { id },
    fetchPolicy: "network-only",
  });
  return data?.singleActivityBooking ?? null;
}

export async function fetchActivityBookingByFlight(flightBookingId) {
  const { data } = await apollo.query({
    query: ActivityBookingsByFlight,
    variables: { flightBookingId },
    fetchPolicy: "network-only",
  });
  return data?.activityBookingsByFlightId ?? null;
}

export async function fetchActivityBookingsByUser() {
  const { data } = await apollo.query({
    query: ActivityBookingsByUser,
    fetchPolicy: "network-only",
  });
  return data?.activityBookingsByUser ?? null;
}

export async function createActivityBooking(
  activityDateTime,
  locationCityId,
  numberOfPeople,
  category,
  activityName,
  activityUrl,
  totalPrice,
  flightBookingId,
  imageUrl
) {
  const { data } = await apollo.mutate({
    mutation: CreateActivityBooking,
    variables: {
      activityDateTime,
      locationCityId,
      numberOfPeople,
      category,
      activityName,
      activityUrl,
      totalPrice: String(totalPrice),
      flightBookingId,
      imageUrl,
    },
  });
  return data?.createActivityBooking ?? null;
}

export async function updateActivityBooking(id, numberOfPeople, totalPrice) {
  const { data } = await apollo.mutate({
    mutation: UpdateActivityBooking,
    variables: { id, numberOfPeople, totalPrice },
  });
  return data?.updateActivityBooking ?? null;
}

export async function deleteActivityBooking(id) {
  const { data } = await apollo.mutate({
    mutation: DeleteActivityBooking,
    variables: { id },
  });
  return data?.deleteActivityBooking ?? null;
}

export async function fetchTicketmasterEvents({
  city,
  countryCode,
  startDateTime,
  endDateTime,
  classificationName,
  size = 24,
}) {
  const { data } = await apollo.query({
    query: TICKETMASTER_EVENTS,
    variables: {
      city,
      countryCode,
      startDateTime,
      endDateTime,
      classificationName: classificationName || undefined,
      size,
    },
    fetchPolicy: "no-cache",
  });
  return data?.ticketmasterEvents ?? [];
}
