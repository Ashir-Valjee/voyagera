
const ActivityBookings = ({ bookings }) => {
    if (!bookings || bookings.length === 0) {
        return <p className="text-center text-base-content/60"> No activities booked yet.</p>
    }

    // return(
    //     <div>
    //         <div className="divider"></div>
    //         <h3 className="text-xl font-semibold text-center mt-4"></h3>

    //         <div>
    //             {bookings.map((booking) => (
    //                 <div key={booking.id} className="card bg-base-200 shadow-md mb-8">
    //                     <div>
    //                         <h4 className="text-lg font-semibold">
    //                             {booking.activityName}
    //                         </h4>
    //                     </div>
    //                     <figure className="aspect-[16/9]">
    //                         <img src={booking.imageUrl} alt={booking.activityName} className="w-full h-full object-cover"/>
    //                     </figure>

    //                 </div>

    //             ))}

    //         </div>
    //     </div>
    // )
    return (
    <div className="space-y-6 mt-4">
      {bookings.map((booking) => (
        <div key={booking.id} className="card bg-base-100 shadow-md overflow-hidden">
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
            <h4 className="card-title text-lg font-semibold">{booking.activityName}</h4>

            {/* Category badge */}
            {booking.category && (
              <span className="badge badge-outline mb-2">{booking.category}</span>
            )}

            {/* Details grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-base-content/80">
              <p><strong>Date & Time:</strong> {new Date(booking.activityDateTime).toLocaleString()}</p>
              <p><strong>Location:</strong> {booking.flightBooking?.destinationCity?.city}</p>
              <p><strong>People:</strong> {booking.numberOfPeople}</p>
              <p><strong>Total Price:</strong> £{booking.totalPrice}</p>
            </div>

    
          </div>
        </div>
      ))}
    </div>
  );
}

export default ActivityBookings