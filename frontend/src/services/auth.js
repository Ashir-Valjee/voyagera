import { apollo } from "../lib/apollo";
import { LOGIN } from "./gql/auth";

/** Log in and persist tokens; returns { access, refresh } */
export async function login(email, password) {
  const { data } = await apollo.mutate({
    mutation: LOGIN,
    variables: { email, password },
  });
  const access = data?.login?.access;
  const refresh = data?.login?.refresh;

  // IMPORTANT: match the keys your Apollo auth link reads
  localStorage.setItem("access", access || "");
  localStorage.setItem("refresh", refresh || "");
  return { access, refresh };
}

export function logout() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
}
