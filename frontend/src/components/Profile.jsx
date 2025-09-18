
import { useState, useEffect } from 'react';
import PlaceholderImage from "../assets/Portrait_Placeholder.png";
import FlightBookings from './FlightBookingProfile';
import ActivityBookings from './ActivityProfile';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import BookingPDF from './BookingPDF';

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
    flightBookings: [],
    activityBookings: [],
  });

  const [tempFirstName, setTempFirstName] = useState(profile.firstName || "");
  const [tempLastName, setTempLastName] = useState(profile.lastName || "");
  const [activeTab, setActiveTab] = useState("flights");

    useEffect(() => {
        if (initialProfile) setProfile(initialProfile);
    }, [initialProfile]);

    const triggerFileUpload = () => document.getElementById('profile-pic-input').click();

  // --- File Upload ---
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const updatedProfile = { ...profile, profilePic: file };
      setProfile(updatedProfile);
      handleAutoSave('profilePic', file);
    }
  };

  // --- Auto save ---
  const handleAutoSave = async (field, value) => {
    const updatedProfile = { ...profile, [field]: value };
    setProfile(updatedProfile);
    try {
      const result = await onUpdate?.(updatedProfile);
      if (result?.profile) setProfile(prev => ({ ...prev, ...result.profile }));
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  // --- Save name ---
  const handleSaveName = async () => {
    const updatedProfile = { ...profile, firstName: tempFirstName, lastName: tempLastName };
    setProfile(updatedProfile);
    try {
      const result = await onUpdate?.(updatedProfile);
      if (result?.profile) setProfile(prev => ({ ...prev, ...result.profile }));
    } catch (error) {
      console.error("Failed to save name:", error);
    }
  };

  const interests = [
    { key: 'likesMusic', label: '🎵 Music' },
    { key: 'likesSports', label: '⚽ Sports' },
    { key: 'likesArts', label: '🎨 Arts' },
    { key: 'likesFilm', label: '🎬 Film' },
    { key: 'likesFamily', label: '👨‍👩‍👧‍👦 Family' },
  ];

  // --- Prepare flights + related activities ---
  const flightsWithActivities = profile.flightBookings.map(flight => {
    const relatedActivities = profile.activityBookings.filter(
      activity => activity.flightBooking?.id === flight.id
    );
    return {
      ...flight,
      departureCity: flight.departureCity?.city,
      destinationCity: flight.destinationCity?.city,
      activities: relatedActivities,
    };
  });

  return (
    <div className="card bg-base-100 shadow-xl max-w-2xl mx-auto">
      <div className="card-body">

        {/* Profile Picture */}
        <div className="flex flex-col items-center space-y-4">
          <h2 className="card-title text-2xl">{profile.firstName} {profile.lastName}</h2>

          <div className="relative">
            <div className="avatar">
              <div className="w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img
                  src={
                    profile.profilePic instanceof File
                      ? URL.createObjectURL(profile.profilePic)
                      : profile.profilePic || PlaceholderImage
                  }
                  alt="Profile"
                />
              </div>
            </div>
            <div
              className="absolute bottom-1 right-1 rounded-full bg-primary p-2 border-2 border-base-100 cursor-pointer hover:bg-primary-focus transition"
              onClick={triggerFileUpload}
            >
              <svg xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-5 w-5 text-primary-content">
                <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z"/>
                <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z"/>
              </svg>
            </div>
          </div>
          <input id="profile-pic-input" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </div>

        {/* Name Inputs */}
        <div className="form-control mt-4">
          <label className='label justify-center font-semibold'>
            <span className='label-text'>👤 Name</span>
          </label>
          <div className="flex gap-4">
            <input type="text" placeholder='First Name' value={tempFirstName} onChange={e => setTempFirstName(e.target.value)} className="input input-bordered w-1/2" />
            <input type="text" placeholder='Surname' value={tempLastName} onChange={e => setTempLastName(e.target.value)} className="input input-bordered w-1/2" />
            <button className="btn btn-primary btn-sm" onClick={handleSaveName}>Save</button>
          </div>
        </div>

        {/* Home City */}
        <div className="form-control mt-4">
          <label className="label justify-center font-semibold">
            <span className="label-text">🏙️ Home City</span>
          </label>
          <select
            className="select select-bordered w-full mt-2"
            value={String(profile.homeCity?.id || '')}
            onChange={(e) => {
              const selectedCity = cities.find(city => String(city.id) === e.target.value);
              handleAutoSave('homeCity', selectedCity);
            }}
          >
            <option value="">Select a city</option>
            {cities.map(city => <option key={city.id} value={String(city.id)}>{city.city}</option>)}
          </select>
        </div>

        {/* Interests */}
        <div className="form-control mt-6">
          <label className="label"><span className="label-text font-semibold">✨ Interests</span></label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {interests.map(interest => (
              <div key={interest.key} className="form-control">
                <label className="label cursor-pointer justify-start space-x-3">
                  <input type="checkbox" checked={profile[interest.key]} onChange={e => handleAutoSave(interest.key, e.target.checked)} className="checkbox checkbox-primary" />
                  <span className="label-text">{interest.label}</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className='mt-8'>
          <div className='tabs justify-center'>
            <button className={`tab tab-bordered ${activeTab === "flights" ? "tab-active" : ""}`} onClick={() => setActiveTab("flights")}>My Flight Bookings ✈️</button>
            <button className={`tab tab-bordered ${activeTab === "activities" ? "tab-active" : ""}`} onClick={() => setActiveTab("activities")}>My Activity Bookings</button>
          </div>
        </div>

        {/* Booking Content */}
        <div className="mt-6">
          {activeTab === "flights" && (
            <FlightBookings
              bookings={profile.flightBookings}
              onDelete={deletedId => setProfile(prev => ({ ...prev, flightBookings: prev.flightBookings.filter(b => b.id !== deletedId) }))}
              onUpdate={updatedBooking => setProfile(prev => ({ ...prev, flightBookings: prev.flightBookings.map(b => b.id === updatedBooking.id ? updatedBooking : b) }))}
            />
          )}
          {activeTab === "activities" && (
            <ActivityBookings bookings={profile.activityBookings} />
          )}
        </div>

        {/* PDF Download Section */}
        {flightsWithActivities.length > 0 && (
          <div className="mt-6 flex flex-col items-center space-y-4">
            <PDFDownloadLink
              document={<BookingPDF flights={flightsWithActivities} />}
              fileName="itinerary.pdf"
              className="btn btn-primary"
            >
              {({ loading }) => loading ? "Generating PDF..." : "Download Itinerary"}
            </PDFDownloadLink>
          </div>
        )}

      </div>
    </div>
  );
};

export default Profile;

