import { Pencil, Trash2} from 'lucide-react'
import { useState } from "react";
import { deleteFlightBooking } from "../services/flights";


const FlightBookings = ({ bookings, onDelete }) => {
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [loading, setLoading] = useState(false);

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
    
    if (!bookings || bookings.length === 0) {
        return <p className="text-center text-base-content/60">No flights booked yet.</p>;
    }

    return (
        <div>
            <div className="divider"></div>
            {/* <h3 className="text-xl font-semibold text-center mt-4">My Flight Bookings ✈️</h3> */}

            <div className="space-y-2 mt-4">
                {bookings.map((booking) => (
                    <div key={booking.id} className="card bg-base-200 shadow-md mb-8">
                        <div className="card-header px-4 py-2 bg-primary text-primary-content rounded-t">
                            <h4 className="text-lg font-semibold">
                                {booking.departureCity?.city} to {booking.destinationCity?.city}
                            </h4>
                        </div>
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
                        <div className="card-actions justify-end p-4">
                            <button className="btn btn-primary btn-sm"> 
                                <Pencil className='w-4 h-4' />
                            </button>
                            <button
                className="btn btn-soft btn-error btn-sm ml-2"
                onClick={() => setSelectedBooking(booking)}
                >
                    <Trash2 className="w-4 h-4" />
                </button>
                <button className="btn btn-outline btn-sm ml-2">
                    View Activities
                </button>
                </div>
            </div>
            ))}
        </div>

        {/* Confirmation Modal */}
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
    );
};

export default FlightBookings;