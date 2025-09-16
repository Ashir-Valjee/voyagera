import { apollo } from "../lib/apollo";
<<<<<<< HEAD
import {
  SingleActivityBooking,
  ActivityBookingByFlight,
  CreateActivityBooking,
  DeleteActivityBooking,
  UpdateActivityBooking,
  TICKETMASTER_EVENTS,
} from "./gql/activity_booking";
=======
import { SingleActivityBooking, ActivityBookingsByFlight, CreateActivityBooking, DeleteActivityBooking, UpdateActivityBooking, ActivityBookingsByUser } from "./gql/activity_booking";

>>>>>>> main

export async function fetchSingleActivityBooking(id) {
  const { data } = await apollo.query({
    query: SingleActivityBooking,
    variables: { id },
    fetchPolicy: "network-only",
  });
  return data?.singleActivityBooking ?? null;
}

export async function fetchActivityBookingByFlight(flightBookingId) {
<<<<<<< HEAD
  const { data } = await apollo.query({
    query: ActivityBookingByFlight,
    variables: { flightBookingId },
    fetchPolicy: "network-only",
  });
  return data?.activityBookingByFlightId ?? null;
=======
    const { data } = await apollo.query({
        query: ActivityBookingsByFlight,
        variables: {flightBookingId},
        fetchPolicy: "network-only",
    });
    return data?.activityBookingsByFlightId ?? null;
}

export async function fetchActivityBookingsByUser(){
  const { data } = await apollo.query({
        query: ActivityBookingsByUser,
        fetchPolicy: "network-only",
    });
    return data?.activityBookingsByUser ?? null;
>>>>>>> main
}

export async function createActivityBooking(
  activityDateTime,
  locationCityId,
  numberOfPeople,
  category,
  activityName,
  activityUrl,
  totalPrice,
  flightBookingId
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
      totalPrice,
      flightBookingId,
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
  startDateTime,
  endDateTime,
  classificationName,
  size = 24,
}) {
  const { data } = await apollo.query({
    query: TICKETMASTER_EVENTS,
    variables: {
      city,
      startDateTime,
      endDateTime,
      classificationName: classificationName || undefined,
      size,
    },
    fetchPolicy: "no-cache",
  });
  return data?.ticketmasterEvents ?? [];
}
