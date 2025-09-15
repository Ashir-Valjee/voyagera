import { apollo } from "../lib/apollo";
import { Profile, UpdateProfile } from "./gql/profile";

export async function fetchUserProfile() {
    const { data } = await apollo.query({
      query: Profile,
      fetchPolicy: "network-only"
    });
    return data?.getUserProfile ?? null;
}

export async function updateUserProfile(profileInfo) {
    const { data } = await apollo.mutate({
    mutation: UpdateProfile,
    variables:profileInfo,
  });
   return data?.updateProfile ?? null
}