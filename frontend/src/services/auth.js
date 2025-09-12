import { apollo } from "../lib/apollo";
import { LOGIN } from "./gql/auth";
import { REGISTER } from "./gql/auth";

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

export async function signup(email, password) {
  const { data } = await apollo.mutate({
    mutation: REGISTER,
    variables: { email, password },
  });
  const access = data?.register?.access;
  const refresh = data?.register?.refresh;

  // align with your auth link (reads 'access' from localStorage)
  if (access) localStorage.setItem("access", access);
  if (refresh) localStorage.setItem("refresh", refresh);

  return { access, refresh };
}
