import { apollo } from "../lib/apollo";
import { CITIES } from "./gql/cities";

export async function fetchCities() {
  const { data } = await apollo.query({
    query: CITIES,
    fetchPolicy: "cache-first",
  });
  return data?.cities ?? [];
}
