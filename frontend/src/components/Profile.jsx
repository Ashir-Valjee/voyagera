import { useState, useEffect } from 'react';
import PlaceholderImage from "../assets/Portrait_Placeholder.png"
import FlightBookings from './FlightBookingProfile'
import { FlightBooking } from '../services/gql/flights';
import ActivityBookings from './ActivityProfile';

const Profile = ({ initialProfile, cities = [], onUpdate }) => {
    const [profile, setProfile] = useState(initialProfile || {
        id: null,
        firstName: '',
        lastName: '',
        profilePic: null,
        homeCityId: null,
        likesMusic: false,
        likesSports: false,
        likesArts: false,
        likesFilm: false,
        likesFamily: false,
    });

    const[activeTab, setActiveTab] = useState("flights");

    useEffect(() => {
        if (initialProfile) {
            setProfile(initialProfile);
        }
    }, [initialProfile]);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const updatedProfile = { ...profile, profilePic: file };
        setProfile(updatedProfile);
        handleAutoSave('profilePic', file);
        }
    };

    const triggerFileUpload = () => {
        document.getElementById('profile-pic-input').click();
    };

    const handleAutoSave = async (field, value) => {
        const updatedProfile = { ...profile, [field]: value };
        setProfile(updatedProfile);
        
        try {
        const result = await onUpdate?.(updatedProfile);
        
        // If the update was successful and returned a profile, use that data
        if (result && result.profile) {
            setProfile(prevProfile => ({
                ...prevProfile,
                ...result.profile
            }));
        }
        } catch (error) {
            console.error('Failed to update profile:', error);
            // Revert the local change if the server update failed
            setProfile(profile);
        }
    };

    const interests = [
        { key: 'likesMusic', label: '🎵 Music', icon: '🎵' },
        { key: 'likesSports', label: '⚽ Sports', icon: '⚽' },
        { key: 'likesArts', label: '🎨 Arts', icon: '🎨' },
        { key: 'likesFilm', label: '🎬 Film', icon: '🎬' },
        { key: 'likesFamily', label: '👨‍👩‍👧‍👦 Family', icon: '👨‍👩‍👧‍👦' },
    ];

    return (
        <div className="card bg-base-100 shadow-xl max-w-2xl mx-auto">
        <div className="card-body">
            <div className="mb-6">
            <h2 className="card-title text-2xl">Profile</h2>
            </div>

            {/* Profile Picture */}
            <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                    <div className="avatar">
                        <div className="w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                            <img
                                src={
                                    profile.profilePic instanceof File
                                        ? URL.createObjectURL(profile.profilePic)
                                        : profile.profilePic 
                                            ? profile.profilePic 
                                            : PlaceholderImage
                                }
                                alt="Profile"
                            />
                        </div>
                    </div>
                    
                    <div 
                    className="absolute bottom-1 right-1 rounded-full bg-primary p-2 border-2 border-base-100 cursor-pointer hover:bg-primary-focus transition" 
                    onClick={triggerFileUpload}
                    >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-5 w-5 text-primary-content"
                    >
                        <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                        <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                    </svg>
                    </div>
                </div>
                
                <input 
                    id="profile-pic-input"
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden" 
                />
                </div>

            {/* Home City */}
            <div className="form-control">
                <label className="label justify-center font-semibold">
                <span className="label-text font-semibold">🏙️ Home City</span>
                </label>
                <select 
                className="select select-bordered w-full mt-4"
                value={String(profile.homeCity?.id || '')}
                onChange={(e) => {
                    const selectedCity = cities.find(city => String(city.id) === e.target.value);
                    handleAutoSave('homeCity', selectedCity);
                }}
                >
                <option value="">Select a city</option>
                {cities.map(city => (
                    <option key={city.id} value={String(city.id)}>
                    {city.city}
                    </option>
                ))}
                </select>
            </div>

            {/* Interests */}
            <div className="form-control mt-8">
                <label className="label">
                <span className="label-text font-semibold ">✨ Interests</span>
                </label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {interests.map(interest => (
                    <div key={interest.key} className="form-control">
                        <label className="label cursor-pointer justify-start space-x-3">
                            <input 
                            type="checkbox" 
                            checked={profile[interest.key]}
                            onChange={(e) => handleAutoSave(interest.key, e.target.checked)}
                            className="checkbox checkbox-primary" 
                            />
                            <span className="label-text">{interest.label}</span>
                        </label>
                    </div>
                ))}
                </div>
            </div>

            {/* Tabs */}
            <div className='mt-8'>
                <div className='tabs justify-center'>

                    <button className={`tab tab-bordered ${activeTab === "flights" ? "tab-active" : ""}`} onClick={() => setActiveTab("flights")}>
                        Flight Bookings
                    </button>
                    <button className={`tab tab-bordered ${activeTab === "activities" ? "tab-active" : ""}`} onClick={() => setActiveTab("activities")}>
                        Activity Bookings
                    </button>
                    
                </div>
            </div>

            <div className="mt-6">
            {activeTab === "flights" && (
                <FlightBookings bookings={initialProfile?.flightBookings} />
            )}
            {activeTab === "activities" && (
                <ActivityBookings bookings={initialProfile?.activityBookings} />
            )}
            </div>

            </div> 
        </div>
    );
};

export default Profile;