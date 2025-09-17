import { apollo } from "../lib/apollo";
import { GET_TOP_DESTINATIONS } from "./gql/destinations";

export async function fetchTopDestinations(limit = 5) {
    const { data } = await apollo.query({
        query: GET_TOP_DESTINATIONS,
        variables: { limit },
        fetchPolicy: "network-only",
    });

    return data?.topDestinations ?? [];
    }

