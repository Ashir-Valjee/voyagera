import { apollo } from "../lib/apollo";
import { SingleActivityBooking } from "./gql/activity_booking";
import { ActivityBookingByFlight } from "./gql/activity_booking";

export async function fetchSingleActivityBooking(id) {
    const { data } = await apollo.query({
        query: SingleActivityBooking,
        variables: {id},
        fetchPolicy: "network-only",
    }); 
    return data?.singleActivityBooking ?? null;
}

export async function fetchActivityBookingByFlight(flightBookingId) {
    const { data } = await apollo.query({
        query: ActivityBookingByFlight,
        variables: {flightBookingId},
        fetchPolicy: "network-only",
    });
    return data?.activityBookingByFlightId ?? null;
}