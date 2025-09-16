
const FlightBookings = ({ bookings }) => {
    if (!bookings || bookings.length === 0) {
        return <p className="text-center text-base-content/60">No flights booked yet.</p>;
    }

    return (
        <div>
            <div className="divider"></div>
            <h3 className="text-xl font-semibold text-center mt-4">My Flight Bookings ✈️</h3>

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
                            <button className="btn btn-primary btn-sm">Edit Booking</button>
                            <button className="btn btn-outline btn-sm ml-2">Delete Booking</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FlightBookings;
