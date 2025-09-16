import { apollo } from "../lib/apollo";
import { Profile, UpdateProfile } from "./gql/profile";

export async function fetchUserProfile() {
    const { data } = await apollo.query({
        query: Profile,
        fetchPolicy: "network-only"
    });
    return data?.getUserProfile ?? null;
}

export async function uploadProfilePicture(file) {
    const UPLOAD_URL = '/upload/';
    const token = localStorage.getItem("access");
    
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(UPLOAD_URL, {
        method: 'POST',
        headers: { 'Authorization': token ? `Bearer ${token}` : '' },
        body: formData,
    });

    const jsonResponse = await response.json();
    if (!response.ok) {
        throw new Error(jsonResponse.error || 'Upload failed');
    }
    return jsonResponse; 
}

export async function updateUserProfile(profileInfo) {
    const { data } = await apollo.mutate({
    mutation: UpdateProfile,
    variables:profileInfo,
    });
    return data?.updateProfile ?? null
}

