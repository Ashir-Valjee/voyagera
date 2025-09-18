import { useState, useEffect } from 'react';
import Profile from "../components/Profile";
import { useAuth } from "../contexts/AuthContext";
import { updateUserProfile, uploadProfilePicture } from "../services/profile";
import { fetchFlightBookings, deleteFlightBooking } from "../services/flights";
import { fetchCities } from "../services/city";
import { fetchActivityBookingsByUser } from '../services/activity_booking';

const ProfilePage = () => {
    const { user, loading: authLoading, refreshUser } = useAuth(); 
    const [cities, setCities] = useState([]);
    const [flightBookings, setFlightBookings] = useState([]);
    const [activityBookings, setActivityBookings] = useState([]);
    const [pageError, setPageError] = useState(null);

    useEffect(() => {
        if (user) {
            Promise.all([
                fetchFlightBookings(),
                fetchCities(),
                fetchActivityBookingsByUser()
            ])
            .then(([flightBookingsData, citiesData, activityBookingsData]) => {
                setFlightBookings(flightBookingsData || []);
                setCities(citiesData || []);
                setActivityBookings(activityBookingsData || []);
            })
            .catch(err => {
                console.error("Failed to fetch page data:", err);
                setPageError(err.message);
            });
        }
    }, [user]); 

    const handleUpdate = async (changedInfo) => {
    try {
        const fullUpdatedProfile = { ...user, ...changedInfo };
        let finalImageUrl = fullUpdatedProfile.profilePic; 

        if (changedInfo.profilePic instanceof File) {
            const uploadResult = await uploadProfilePicture(changedInfo.profilePic);
            finalImageUrl = uploadResult.fileUrl; 
        }

        const variables = {
            firstName: fullUpdatedProfile.firstName,
            lastName: fullUpdatedProfile.lastName,
            homeCityId: fullUpdatedProfile.homeCity?.id,
            profilePic: finalImageUrl, 
            likesMusic: fullUpdatedProfile.likesMusic,
            likesSports: fullUpdatedProfile.likesSports,
            likesArts: fullUpdatedProfile.likesArts,
            likesFilm: fullUpdatedProfile.likesFilm,
            likesFamily: fullUpdatedProfile.likesFamily,
        };
        
        const result = await updateUserProfile(variables);

        if (result && result.success) {
            await refreshUser(); 
            return { success: true, profile: result.profile };
        } else {
            const errors = result?.errors || ['Update failed'];
            setPageError(errors.join(', '));
            return { success: false, errors };
        }
    } catch (err) {
        console.error('Profile update error:', err);
        setPageError(err.message);
        return { success: false, errors: [err.message] };
    }
};
    const handleDeleteFlight = async (flightId) => {
        try {
            await deleteFlightBooking(flightId);
            fetchFlightBookings().then(data => setFlightBookings(data || []));
        } catch (err) {
            console.log(err)
            setPageError("Could not delete flight");
        }
    };

    if (authLoading) return <p className="text-center p-8">Loading your profile...</p>;
    
    if (pageError) return <p className="alert alert-error text-center p-8">Error: {pageError}</p>;

    if (!user) return (
        <div className="text-center p-8">
            <p className="text-xl mb-4">Please log in to view your profile.</p>
        </div>
    );
    
    return (
        <div className="p-4 md:p-8">
            <Profile
                initialProfile={{ ...user, flightBookings, activityBookings }}
                cities={cities} 
                onUpdate={handleUpdate} 
                onDeleteFlight={handleDeleteFlight}
            />
        </div>
    );
};

export default ProfilePage;