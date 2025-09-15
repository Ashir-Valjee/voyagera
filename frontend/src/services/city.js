import { apollo } from "../lib/apollo";
import { Cities } from "../gql/city"


export async function fetchCities() {
  const { data } = await apollo.query({
    query: Cities,
    fetchPolicy: "network-only"
  });
  return data?.cities ?? null;
}