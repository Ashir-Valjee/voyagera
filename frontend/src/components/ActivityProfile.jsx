
const ActivityBookings = ({ bookings }) => {
    if (!bookings || bookings.length === 0) {
        return <p className="text-center text-base-content/60"> No activities booked yet.</p>
    }

    return(
        <div>
            <div className="divider"></div>
            <h3 className="text-xl font-semibold text-center mt-4"></h3>

            <div>
                {bookings.map((booking) => (
                    <div key={booking.id} className="card bg-base-200 shadow-md mb-8">
                        <div>
                            <h4 className="text-lg font-semibold">
                                {booking.activityName}
                            </h4>
                        </div>

                    </div>

                ))}

            </div>
        </div>
    )
}

export default ActivityBookings