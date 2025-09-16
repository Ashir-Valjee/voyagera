import { useState, useEffect } from 'react';
import Profile from "../components/Profile";
import { fetchUserProfile, updateUserProfile, uploadProfilePicture } from "../services/profile";
import { fetchFlightBookings } from "../services/flights";
import { fetchCities } from "../services/city";
import { useAuth } from "../contexts/AuthContext";

const ProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const { isAuthenticated } = useAuth(); // Just get authentication status

    useEffect(() => {
        if (!isAuthenticated) {
            setLoading(false);
            setError("Please log in to view your profile");
            return;
        }

        // Only fetch data if authenticated
        setLoading(true);
        setError(null);
        
        Promise.all([
            fetchUserProfile(),
            fetchFlightBookings(),
            fetchCities()
        ])
        .then(([profileData, flightBookingsData, citiesData]) => {
            setProfile({
                ...profileData,
                flightBookings: flightBookingsData || [], 
            });
            setCities(citiesData || []);
        })
        .catch(err => {
            console.error("Failed to fetch profile data:", err);
            setError(err.message);
        })
        .finally(() => {
            setLoading(false);
        });
    }, [isAuthenticated]); // Re-run when authentication changes

    const handleUpdate = async (profileInfo) => {
        const updatedData = { ...profile, ...profileInfo };
        
        try {
            const variables = {
                firstName: updatedData.firstName,
                lastName: updatedData.lastName,
                homeCityId: updatedData.homeCity?.id,
                likesMusic: updatedData.likesMusic,
                likesSports: updatedData.likesSports,
                likesArts: updatedData.likesArts,
                likesFilm: updatedData.likesFilm,
                likesFamily: updatedData.likesFamily,
            };

            if (profileInfo.profile_pic instanceof File) {
                const uploadResult = await uploadProfilePicture(profileInfo.profile_pic);
                variables.profilePic = uploadResult.fileUrl;
            }

            const result = await updateUserProfile(variables);

            if (result && result.success) {
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
    
    if (error) return (
        <div className="text-center p-8">
            <p className="text-xl mb-4">Error: {error}</p>
            {!isAuthenticated && <p>Please sign in using the navigation bar.</p>}
        </div>
    );

    return (
        <>
            <div className="p-4 md:p-8">
                <Profile
                    initialProfile={profile}
                    cities={cities} 
                    onUpdate={handleUpdate} 
                />
            </div>
        </>
    );
};

export default ProfilePage;