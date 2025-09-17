import { Pencil, Trash2, Users } from "lucide-react";
import { prettyWhen } from "../utils/helpers"

const ActivityBookings = ({ bookings }) => {
    if (!bookings || bookings.length === 0) {
        return <p className="text-center text-base-content/60">No activities booked yet.</p>;
    }

    return (
        <div className="space-y-4 mt-4"> {/* Stack cards vertically */}
            {bookings.map((booking) => (
                <div
                    key={booking.id}
                    className="card bg-base-100 shadow-md overflow-hidden"
                >
                    {/* Image at the top */}
                    {booking.imageUrl && (
                        <figure className="aspect-[16/9]">
                            <img
                                src={booking.imageUrl}
                                alt={booking.activityName}
                                className="w-full h-full object-cover"
                            />
                        </figure>
                    )}

                    {/* Card body with details */}
                    <div className="card-body">
                        {/* Title and Category Badge */}
                        <div className="flex items-start justify-between gap-2">
                            <h3 className="card-title text-xl leading-tight">{booking.activityName}</h3>
                            <span className="badge badge-outline shrink-0">{booking.category}</span>
                        </div>

                        {/* Details */}
                        <div className="text-sm text-base-content/80 mb-2 space-y-1">
                            <p>{prettyWhen(booking.activityDateTime)}</p>
                            <p>{booking.flightBooking?.destinationCity?.city}</p>
                            <p className="flex items-center gap-1">
                                <Users className="w-4 h-4" /> {booking.numberOfPeople}
                            </p>
                            <p>£{booking.totalPrice}</p>
                        </div>

                        {/* Actions */}
                        <div className="card-actions justify-end gap-2">
                            <button className="btn btn-primary btn-sm">
                                <Pencil className="w-4 h-4" />
                            </button>
                            <button className="btn btn-outline btn-sm">
                                <Trash2 className="w-4 h-4" />
                            </button>
                            <a
                                href={booking.activityUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm"
                            >
                                Details
                            </a>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ActivityBookings;



