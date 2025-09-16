import { useState } from 'react';
import ActivityBookings from './ActivityProfile';
import { fetchActivityBookingByFlight } from '../services/activity_booking';
import { Pencil, Trash2 } from 'lucide-react';

const FlightBookings = ({ bookings }) => {
    // 🔹 Track which flight has its activities open
    const [expandedFlightId, setExpandedFlightId] = useState(null);
    // 🔹 Store fetched activities
    const [activities, setActivities] = useState({});
    const [loadingFlightId, setLoadingFlightId] = useState(null);

    if (!bookings || bookings.length === 0) {
        return <p className="text-center text-base-content/60">No flights booked yet.</p>;
    }

    const handleToggleActivities = async (flightId) => {
        if (expandedFlightId === flightId) {
            // 🔹 Close if already open
            setExpandedFlightId(null);
            return;
        }

        // 🔹 If not fetched yet, load activities for this flight
        if (!activities[flightId]) {
            setLoadingFlightId(flightId);
            try {
                const data = await fetchActivityBookingByFlight(Number(flightId));
                setActivities((prev) => ({
                    ...prev,
                    [flightId]: data || [],
                }));
            } catch (err) {
                console.error("Failed to fetch activities:", err);
                setActivities((prev) => ({
                    ...prev,
                    [flightId]: [],
                }));
            } finally {
                setLoadingFlightId(null);
            }
        }

        // 🔹 Expand this flight card
        setExpandedFlightId(flightId);
    };

    return (
        <div>
            <div className="divider"></div>
            <div className="space-y-2 mt-4">
                {bookings.map((booking) => (
                    <div key={booking.id} className="card bg-base-200 shadow-md mb-8">
                        {/* Flight Header */}
                        <div className="card-header px-4 py-2 bg-primary text-primary-content rounded-t">
                            <h4 className="text-lg font-semibold">
                                {booking.departureCity?.city} to {booking.destinationCity?.city}
                            </h4>
                        </div>

                        {/* Flight Details */}
                        <div className="card-body p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p><strong>Departure Airport:</strong> {booking.departureAirport}</p>
                                    <p><strong>Departure Date & Time:</strong> {new Date(booking.departureDateTime).toLocaleString()}</p>
                                    <p><strong>Arrival Airport:</strong> {booking.destinationAirport}</p>
                                    <p><strong>Arrival Date & Time:</strong> {new Date(booking.arrivalDateTime).toLocaleString()}</p>
                                </div>
                                <div>
                                    <p><strong>Flight Duration:</strong> {booking.flightDuration} hours</p>
                                    <p><strong>Number of Stops:</strong> {booking.numberOfStops}</p>
                                    <p><strong>Passengers:</strong> {booking.numberOfPassengers}</p>
                                    <p><strong>Total Price:</strong> £{booking.totalPrice}</p>
                                    <p><strong>Booked On:</strong> {new Date(booking.dateCreated).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Flight Actions */}
                        <div className="card-actions justify-end p-4">
                            <button className="btn btn-primary btn-sm">
                                <Pencil className="w-4 h-4" />
                            </button>
                            <button className="btn btn-outline btn-sm ml-2">
                                <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                                className="btn btn-outline btn-sm ml-2"
                                onClick={() => handleToggleActivities(booking.id)}
                            >
                                {expandedFlightId === booking.id ? "Close Activities" : "View Activities"}
                            </button>
                        </div>

                        {/* Activities Section (conditionally shown) */}
                        {expandedFlightId === booking.id && (
                            <div className="card bg-base-100 shadow-inner mx-4 mb-4">
                                <div className="card-body">
                                    {loadingFlightId === booking.id ? (
                                        <p className="text-center text-base-content/60">Loading activities...</p>
                                    ) : (
                                        <ActivityBookings bookings={activities[booking.id]} />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FlightBookings;

