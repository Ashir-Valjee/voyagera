import { apollo } from "../lib/apollo";
import { ME } from "./gql/user";

async function fetchMe() {
  const { data } = await apollo.query({
    query: ME,
    fetchPolicy: "network-only",
  });
  return data?.me ?? null;
}

export default fetchMe;
