import { useState, useEffect } from 'react';
import Profile from "../components/Profile";
import { fetchUserProfile, updateUserProfile, uploadProfilePicture } from "../services/profile";
import { fetchFlightBookings } from "../services/flights";
import { fetchCities } from "../services/city";
import { useAuth } from "../contexts/AuthContext";
import { fetchActivityBookingsByUser } from '../services/activity_booking';

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
            fetchCities(),
            fetchActivityBookingsByUser()
        ])
        .then(([profileData, flightBookingsData, citiesData, activityBookingsData]) => {
            setProfile({
                ...profileData,
                flightBookings: flightBookingsData || [], 
                activityBookings: activityBookingsData || []

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
        // console.log('ProfileInfo received:', profileInfo);
        
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

            if (profileInfo.profilePic instanceof File) {
                // console.log('Uploading file:', profileInfo.profilePic.name);
                const uploadResult = await uploadProfilePicture(profileInfo.profilePic);
                // console.log('Upload result:', uploadResult);

                if (uploadResult.fileUrl) {
                        variables.profilePic = uploadResult.fileUrl;
                } else {
                    throw new Error('File upload failed - no URL returned');
                }
            }
            // console.log('Mutation variables:', variables);

            const result = await updateUserProfile(variables);
            // console.log('Mutation result:', result);

            if (result && result.success) {
                setProfile(prevProfile => ({
                    ...prevProfile,
                    ...result.profile,
                    flightBookings: prevProfile.flightBookings,
                    activityBookings: prevProfile.activityBookings
                }));
                return { success: true, profile: result.profile };
            } else {
                const errors = result?.errors || ['Update failed'];
                setError(result?.errors?.join(', '));
                return { success: false, errors };
            }
        } catch (err) {
            console.error('Profile update error:', err);
            setError(err.message);
            return { success: false, errors: [err.message] };
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