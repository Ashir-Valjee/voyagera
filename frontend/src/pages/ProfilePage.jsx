// import { useState, useEffect } from 'react';
// import Profile from "../components/Profile";
// import { fetchUserProfile, updateUserProfile, uploadProfilePicture } from "../services/profile";
// import { fetchFlightBookings, deleteFlightBooking} from "../services/flights";
// import { fetchCities } from "../services/city";
// import { useAuth } from "../contexts/AuthContext";
// import { fetchActivityBookingsByUser } from '../services/activity_booking';

// const ProfilePage = () => {
//     const [profile, setProfile] = useState(null);
//     const [cities, setCities] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const { user, loading: authLoading, updateUser } = useAuth(); 
    

//     useEffect(() => {
//         if (user) {
//             setLoading(false);
//             setError("Please log in to view your profile");
//             return;
//         }

//         // Only fetch data if authenticated
//         setLoading(true);
//         setError(null);
        
//         Promise.all([
//             fetchUserProfile(),
//             fetchFlightBookings(),
//             fetchCities(),
//             fetchActivityBookingsByUser()
//         ])
//         .then(([profileData, flightBookingsData, citiesData, activityBookingsData]) => {
//             setProfile({
//                 ...profileData,
//                 flightBookings: flightBookingsData || [], 
//                 activityBookings: activityBookingsData || []

//             });
//             setCities(citiesData || []);
//         })
//         .catch(err => {
//             console.error("Failed to fetch profile data:", err);
//             setError(err.message);
//         })
//         .finally(() => {
//             setLoading(false);
//         });
//     }, [user]); 

//     const handleUpdate = async (profileInfo) => {
//         // console.log('ProfileInfo received:', profileInfo);
        
//         try {
//             const variables = {
//                 firstName: profileInfo.firstName,
//                 lastName: profileInfo.lastName,
//                 homeCityId: profileInfo.homeCity?.id,
//                 likesMusic: profileInfo.likesMusic,
//                 likesSports: profileInfo.likesSports,
//                 likesArts: profileInfo.likesArts,
//                 likesFilm: profileInfo.likesFilm,
//                 likesFamily: profileInfo.likesFamily,
//             };

//             if (profileInfo.profilePic instanceof File) {
//                 // console.log('Uploading file:', profileInfo.profilePic.name);
//                 const uploadResult = await uploadProfilePicture(profileInfo.profilePic);
//                 // console.log('Upload result:', uploadResult);

//                 if (uploadResult.fileUrl) {
//                         variables.profilePic = uploadResult.fileUrl;
//                 } else {
//                     throw new Error('File upload failed - no URL returned');
//                 }
//             }
//             // console.log('Mutation variables:', variables);

//             const result = await updateUserProfile(variables);
//             // console.log('Mutation result:', result);

//             if (result && result.success) {
//                 setProfile(prevProfile => ({
//                     ...prevProfile,
//                     ...result.profile,
//                     flightBookings: prevProfile.flightBookings,
//                     activityBookings: prevProfile.activityBookings
//                 }));
//                 updateUser(result.profile); 
//                 return { success: true, profile: result.profile };
//             } else {
//                 const errors = result?.errors || ['Update failed'];
//                 setError(result?.errors?.join(', '));
//                 return { success: false, errors };
//             }
//         } catch (err) {
//             console.error('Profile update error:', err);
//             setError(err.message);
//             return { success: false, errors: [err.message] };
//         }
//     };

//     const handleDeleteFlight = async (flightId) => {
//         try {
//             await deleteFlightBooking(flightId);
//             setProfile(prev => ({
//                 ...prev,
//                 flightBookings: prev.flightBookings.filter(f => f.id !== flightId)
//             }));
//         } catch (err) {
//             console.error("Failed to delete flight:", err);
//             setError("Could not delete flight");
//         }
//     };

//     if (authLoading) return <p className="text-center p-8">Loading your profile...</p>;
    
//     if (error) return (
//         <div className="text-center p-8">
//             <p className="text-xl mb-4">Error: {error}</p>
//             {!user && <p>Please sign in using the navigation bar.</p>}
//         </div>
//     );

//     return (
//         <>
//             <div className="p-4 md:p-8">
//                 <Profile
//                     initialProfile={{ ...user, flightBookings, activityBookings}}
//                     cities={cities} 
//                     onUpdate={handleUpdate} 
//                     onDeleteFlight={handleDeleteFlight}
//                 />
//             </div>
//         </>
//     );
// };

// export default ProfilePage;
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
    
    if (pageError) return <p className="text-center p-8">Error: {pageError}</p>;

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