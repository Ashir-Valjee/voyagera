import { useState } from 'react';
import ActivityBookings from './ActivityProfile';
import { fetchActivityBookingByFlight } from '../services/activity_booking';
import { deleteFlightBooking, updateFlightBooking } from "../services/flights";
import { Pencil, Trash2 } from 'lucide-react';



const FlightBookings = ({ bookings, onDelete, onUpdate }) => {
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [loading, setLoading] = useState(false);
    const [editingBooking, setEditingBooking] = useState(null);
    const [editPassengers, setEditPassengers] = useState(0);
    const [expandedFlightId, setExpandedFlightId] = useState(null);
    const [activities, setActivities] = useState({});
    const [loadingFlightId, setLoadingFlightId] = useState(null);


    const handleDelete = async () => {
        if (!selectedBooking) return;

        try {
        setLoading(true);
        await deleteFlightBooking(selectedBooking.id);

        // update parent state
        if (onDelete) {
            onDelete(selectedBooking.id);
        }
        } catch (err) {
        console.error("Failed to delete booking:", err);
        } finally {
        setLoading(false);
        setSelectedBooking(null); // close modal
        }
    };

    const handleEditClick = (booking) => {
    setEditingBooking(booking);
    setEditPassengers(booking.numberOfPassengers);
    };

    const handleUpdate = async () => {
        if (!editingBooking) return;
        try {
        setLoading(true);

        const oldTotal = Number(editingBooking.totalPrice);
        const oldPassengers = Number(editingBooking.numberOfPassengers);

        const pricePerPassenger = oldTotal / oldPassengers;
        const newTotalPrice = pricePerPassenger * editPassengers;

        // call backend
        const updatedBookingResponse = await updateFlightBooking(
        editingBooking,
        editPassengers
        );

        const updatedBooking = {
            ...editingBooking,
            ...(updatedBookingResponse?.flight_booking || {}),
            id: editingBooking.id, 
            numberOfPassengers: editPassengers,
            totalPrice: newTotalPrice,
            };


        if (onUpdate) {
        onUpdate(updatedBooking);
        }
    } catch (err) {
        console.error("Failed to update booking:", err);
    } finally {
        setLoading(false);
        setEditingBooking(null);
    }
    };

    
    if (!bookings || bookings.length === 0) {
        return <p className="text-center text-base-content/60">No flights booked yet.</p>;
    }

    const handleToggleActivities = async (flightId) => {
        if (expandedFlightId === flightId) {
            setExpandedFlightId(null);
            return;
        }

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

        setExpandedFlightId(flightId);
    };

    return (
        <div>
            <div className="divider"></div>
            <div className="space-y-2 mt-4">
                
                {bookings.map((booking) => (
                    <div key={booking.id} className="card bg-base-200 shadow-md mb-8">
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
                            <button className="btn btn-primary btn-sm" onClick={() => handleEditClick(booking)}>
                                <Pencil className="w-4 h-4" />
                            </button>
                            <button className="btn btn-outline btn-sm ml-2" onClick={() => setSelectedBooking(booking)}>
                                <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                                className="btn btn-outline btn-sm ml-2"
                                onClick={() => handleToggleActivities(booking.id)}
                            >
                                {expandedFlightId === booking.id ? "Close Activities" : "View Activities"}
                            </button>
                        </div>

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


        {/* Update Modal */}
            {editingBooking && (
            <div className="modal modal-open">
            <div className="modal-box">
            <h3 className="font-bold text-lg">Edit Booking</h3>
            <div className="py-4 space-y-2">
            <label>
            Number of Passengers:
            <input
                type="number"
                value={editPassengers}
                onChange={(e) => setEditPassengers(Number(e.target.value))}
                className="input input-bordered w-full"
                min="1"
            />
            </label>
            <p className="font-bold text-xl mt-4">
                New Total Price: £
            {((editingBooking.totalPrice / editingBooking.numberOfPassengers) * editPassengers).toFixed(2)}
            </p>

        </div>
        <div className="modal-action">
            <button className={`btn btn-primary ${loading ? "loading" : ""}`} onClick={handleUpdate}>
            {loading ? "Updating..." : "Save Changes"}
            </button>
            <button className="btn" onClick={() => setEditingBooking(null)} disabled={loading}>
            Cancel
            </button>
        </div>
        </div>
    </div>
    )}


        {/* Delete Modal */}
        {selectedBooking && (
            <div className="modal modal-open">
            <div className="modal-box">
                <h3 className="font-bold text-lg text-error">Confirm Delete</h3>
                <p className="py-4">
                Are you sure you want to delete this booking from{" "}
                <strong>{selectedBooking.departureCity?.city}</strong> to{" "}
                <strong>{selectedBooking.destinationCity?.city}</strong>?
                </p>
                <div className="modal-action">
                <button
                    className={`btn btn-soft btn-error ${loading ? "loading" : ""}`}
                    onClick={handleDelete}
                    disabled={loading}
                >
                    {loading ? "Deleting..." : "Yes, Delete"}
                </button>
                <button
                    className="btn btn-soft"
                    onClick={() => setSelectedBooking(null)}
                    disabled={loading}
                >
                    Cancel
                </button>
                </div>
            </div>
            </div>
        )}
        </div>
    </div>
    );
};

export default FlightBookings;

