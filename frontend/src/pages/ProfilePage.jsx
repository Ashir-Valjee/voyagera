import { useState, useEffect } from 'react';
import Profile from "../components/Profile";
import { fetchUserProfile, updateUserProfile } from "../services/profile";
import { fetchFlightBookings } from "../services/flights";

const ProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
    // Use Promise.all to run both fetches at the same time
    Promise.all([
        fetchUserProfile(),
        fetchFlightBookings()
    ])
    .then(([profileData, flightBookingsData]) => {
        setProfile({
            ...profileData,
            flightBookings: flightBookingsData || [], 
        });
    })
    .catch(err => {
        console.error("Failed to fetch profile data:", err);
        setError(err.message);
    })
    .finally(() => {
        setLoading(false);
    });
    }, []); 

    const handleUpdate = async (profileInfo) => {
        
        try {
            const variables = {
                firstName: profileInfo.firstName,
                lastName: profileInfo.lastName,
                homeCityId: profileInfo.homeCity?.id,
                likesMusic: profileInfo.likesMusic,
                likesSports: profileInfo.likesSports,
                likesArts: profileInfo.likesArts,
                likesFilm: profileInfo.likesFilm,
                likesFamily: profileInfo.likesFamily,
            };

            // Only include the profile picture if it's a new File object
            if (profileInfo.profilePic instanceof File) {
                variables.profilePic = profileInfo.profilePic;
            }

            const result = await updateUserProfile(variables);

            console.log('Server response:', result);
            console.log('Updated profile pic:', result?.updateProfile?.profile?.profilePic);


            if (result && result.success) {
                console.log("Profile updated successfully!");
                // Update local state with the newly saved profile from the server
                setProfile(prevProfile => ({
                    ...prevProfile,
                    ...result.profile
                }));
            } else {
                setError(result?.errors?.join(', '));
            }
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <p className="text-center p-8">Loading your profile...</p>;
    if (error) return <p className="text-center p-8">Error: {error}</p>;


    return (
        <>
            <div className="p-4 md:p-8">
                <Profile
                    initialProfile={profile}
                    // cities={...} 
                    onUpdate={handleUpdate} 
                />
            </div>
        </>
    )
}

export default ProfilePage;
