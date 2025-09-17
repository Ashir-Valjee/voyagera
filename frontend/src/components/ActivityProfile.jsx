import { Pencil, Trash2, Users } from "lucide-react";
import { prettyWhen } from "../utils/helpers";
import { updateActivityBooking, deleteActivityBooking } from "../services/activity_booking";
import { useState } from "react";

const ActivityBookings = ({ bookings, onDelete, onUpdate }) => {
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [editingActivity, setEditingActivity] = useState(null);
    const [editNumberOfPeople, setEditNumberOfPeople] = useState(0);
    const [loading, setLoading] = useState(false);

    if (!bookings || bookings.length === 0) {
        return <p className="text-center text-base-content/60">No activities booked yet.</p>;
    }

    const handleEditClick = (activity) => {
        setEditingActivity(activity);
        setEditNumberOfPeople(activity.numberOfPeople);
    };

    const handleUpdate = async () => {
        if (!editingActivity) return;
        try {
            setLoading(true);

            const pricePerPerson = Number(editingActivity.totalPrice) / Number(editingActivity.numberOfPeople);
            const newTotalPrice = Number((pricePerPerson * editNumberOfPeople).toFixed(2));


            const updatedBookingResponse = await updateActivityBooking(
                editingActivity.id,
                editNumberOfPeople,
                String(newTotalPrice)
            );

            const updatedBooking = {
                ...editingActivity,
                ...(updatedBookingResponse?.activity_booking || {}),
                numberOfPeople: editNumberOfPeople,
                totalPrice: newTotalPrice,
            };

            onUpdate?.(updatedBooking);
        } catch (err) {
            console.error("Failed to update activity:", err);
        } finally {
            setLoading(false);
            setEditingActivity(null);
        }
    };

    const handleDelete = async () => {
        if (!selectedActivity) return;
        try {
            setLoading(true);
            await deleteActivityBooking(selectedActivity.id);
            onDelete?.(selectedActivity.id);
        } catch (err) {
            console.error("Failed to delete activity:", err);
        } finally {
            setLoading(false);
            setSelectedActivity(null);
        }
    };

    return (
        <div className="space-y-4 mt-4">
            {bookings.map((booking) => (
                <div key={booking.id} className="card bg-base-100 shadow-md overflow-hidden">
                    {booking.imageUrl && (
                        <figure className="aspect-[16/9]">
                            <img src={booking.imageUrl} alt={booking.activityName} className="w-full h-full object-cover" />
                        </figure>
                    )}
                    <div className="card-body">
                        <div className="flex items-start justify-between gap-2">
                            <h3 className="card-title text-xl leading-tight">{booking.activityName}</h3>
                            <span className="badge badge-outline shrink-0">{booking.category}</span>
                        </div>
                        <div className="text-sm text-base-content/80 mb-2 space-y-1">
                            <p>{prettyWhen(booking.activityDateTime)}</p>
                            <p>{booking.flightBooking?.destinationCity?.city}</p>
                            <p className="flex items-center gap-1">
                                <Users className="w-4 h-4" /> {booking.numberOfPeople}
                            </p>
                            <p>£{booking.totalPrice}</p>
                        </div>
                        <div className="card-actions justify-end gap-2">
                            <button className="btn btn-primary btn-sm" onClick={() => handleEditClick(booking)}>
                                <Pencil className="w-4 h-4" />
                            </button>
                            <button className="btn btn-outline btn-sm" onClick={() => setSelectedActivity(booking)}>
                                <Trash2 className="w-4 h-4" />
                            </button>
                            <a href={booking.activityUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm">
                                Details
                            </a>
                        </div>
                    </div>
                </div>
            ))}

            {/* Edit Modal */}
            {editingActivity && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">Edit Activity Booking</h3>
                        <div className="py-4 space-y-2">
                            <label>
                                Number of People:
                                <input
                                    type="number"
                                    value={editNumberOfPeople}
                                    onChange={(e) => setEditNumberOfPeople(Number(e.target.value))}
                                    className="input input-bordered w-full"
                                    min="1"
                                />
                            </label>
                            <p className="font-bold text-xl mt-4">
                                Total Price: £{((editingActivity.totalPrice / editingActivity.numberOfPeople) * editNumberOfPeople).toFixed(2)}
                            </p>
                        </div>
                        <div className="modal-action">
                            <button className={`btn btn-primary ${loading ? "loading" : ""}`} onClick={handleUpdate}>
                                {loading ? "Updating..." : "Save Changes"}
                            </button>
                            <button className="btn" onClick={() => setEditingActivity(null)} disabled={loading}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {selectedActivity && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg text-error">Confirm Delete</h3>
                        <p className="py-4">
                            Are you sure you want to delete this activity <strong>{selectedActivity.activityName}</strong>?
                        </p>
                        <div className="modal-action">
                            <button className={`btn btn-error ${loading ? "loading" : ""}`} onClick={handleDelete} disabled={loading}>
                                {loading ? "Deleting..." : "Yes, Delete"}
                            </button>
                            <button className="btn" onClick={() => setSelectedActivity(null)} disabled={loading}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActivityBookings;




