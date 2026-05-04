import React, { useState } from 'react'
import moment from 'moment'
import momentTimezone from 'moment-timezone'
import Button from './Button'
import { findRoomInfo } from '../helpers/bookingForm.js'

function BookingElement({
  bookingData,
  onDeleteBooking,
  roomData
}) {

  const roomInfo = findRoomInfo(bookingData.roomId, roomData)
  const startTime = momentTimezone.tz(bookingData.bookingStart, 'Asia/Ho_Chi_Minh').format('h.mma')
  const endTime = momentTimezone.tz(bookingData.bookingEnd, 'Asia/Ho_Chi_Minh').format('h.mma')
  const [isCancelling, setIsCancelling] = useState(false)

  return (
    <div className="booking__box">
      <div className="booking__innerbox--left">
        <h3 className="header__heading--sub--alt header__heading--small">{moment(bookingData.bookingStart).format('dddd, MMMM Do YYYY')}</h3>
        <p><strong>Title:</strong> {bookingData.title || 'Meeting'}</p>
        <p><strong>Status:</strong> {bookingData.status || 'Pending'}</p>
        {bookingData.status === 'Failed' && bookingData.rejectReason && (
          <p className="text-danger"><strong>Reason:</strong> {bookingData.rejectReason}</p>
        )}
        <p><strong>Participants:</strong> {bookingData.participants || 1}</p>
        <p><strong>Purpose:</strong> {bookingData.purpose}</p>
      </div>
      <div className="booking__innerbox--middle">
        <p>From {startTime} to {endTime}</p>
        <p>Duration {bookingData.duration}hrs</p>
        <p>Level {roomInfo.floor}, {roomInfo.name}</p>
      </div>
      <div className="booking__innerbox--right">
        {new Date(bookingData.bookingStart) > new Date() && bookingData.status !== 'Failed' && (
          <Button
            onClick={() => {
              if (window.confirm('Are you sure you want to cancel this booking?')) {
                setIsCancelling(true)
                onDeleteBooking(bookingData.roomId, bookingData._id)
              }
            }}
            disabled={isCancelling}
            text={isCancelling ? 'Cancelling...' : 'Cancel'}
          />
        )}
      </div>
    </div>
  )
}

export default BookingElement