import React from 'react'
import BookingElement from './BookingElement'
import Avatar from '../assets/avatar.png'

function MyBookings({
  user,
  userBookings,
  onDeleteBooking,
  roomData
}) {
  const now = new Date();
  const upcomingBookings = [];
  const pendingBookings = [];
  const historyBookings = [];

  if (userBookings) {
    userBookings.forEach(booking => {
      const bookingStart = new Date(booking.bookingStart);
      if (booking.status === 'Failed' || bookingStart < now) {
        historyBookings.push(booking);
      } else if (booking.status === 'Accepted') {
        upcomingBookings.push(booking);
      } else {
        pendingBookings.push(booking);
      }
    });
  }

  return (
    <div className="wrapper__bookings">
      <div className="booking__user-info">
        <div className="avatar"><img src={Avatar}/></div>
        <h2>{user}</h2>
      </div>
      <div className="user-booking-container">
        { !!userBookings && userBookings.length > 0 ?
          (
            <React.Fragment>
              <h3 className="header__heading header__heading--sub" style={{marginTop: '2rem'}}>Sắp diễn ra (Upcoming)</h3>
              {upcomingBookings.length > 0 ? upcomingBookings.map(booking => (
                <BookingElement
                  key={booking._id}
                  roomData={roomData}
                  bookingData={booking}
                  onDeleteBooking={onDeleteBooking}
                />
              )) : <p>No upcoming bookings</p>}

              <h3 className="header__heading header__heading--sub" style={{marginTop: '2rem'}}>Đang chờ duyệt (Pending)</h3>
              {pendingBookings.length > 0 ? pendingBookings.map(booking => (
                <BookingElement
                  key={booking._id}
                  roomData={roomData}
                  bookingData={booking}
                  onDeleteBooking={onDeleteBooking}
                />
              )) : <p>No pending bookings</p>}

              <h3 className="header__heading header__heading--sub" style={{marginTop: '2rem'}}>Lịch sử (History)</h3>
              {historyBookings.length > 0 ? historyBookings.map(booking => (
                <BookingElement
                  key={booking._id}
                  roomData={roomData}
                  bookingData={booking}
                  onDeleteBooking={onDeleteBooking}
                />
              )) : <p>No booking history</p>}
            </React.Fragment>
           ) : (<p>You have not yet made any bookings</p>)
        }
      </div>
    </div>
  )
}

export default MyBookings