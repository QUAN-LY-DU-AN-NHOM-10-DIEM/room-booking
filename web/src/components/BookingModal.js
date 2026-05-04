import React, { useState, useEffect } from 'react'
import ReactModal from 'react-modal'
import momentTimezone from 'moment-timezone'
import Button from './Button'
import { findRoomInfo } from '../helpers/bookingForm.js'

const BookingModal = props => {
  console.log('BookingModal props:', props)
  const [cachedBooking, setCachedBooking] = useState(props.selectedBooking)

  useEffect(() => {
    if (props.selectedBooking) {
      setCachedBooking(props.selectedBooking)
    }
  }, [props.selectedBooking])

  const booking = props.selectedBooking || cachedBooking

  const deleteBooking = () => {
    if (!booking) return
    const roomID = booking.roomId
    const bookingID = booking._id
    props.onDeleteBooking(roomID, bookingID)
    props.onCloseBooking()
  }

  return (
    <ReactModal
      isOpen={!!props.selectedBooking}
      onRequestClose={props.onCloseBooking}
      ariaHideApp={true}
      shouldFocusAfterRender={true}
      shouldReturnFocusAfterClose={true}
      contentLabel="Booking"
      appElement={document.getElementById('app')}
      closeTimeoutMS={200}
      className="modal"
    >
      <h3 className="modal__title">Booking Details</h3>
      {booking && (
        <div className="modal__boday">
          <p className="modal__paragraph"><strong>Title: </strong>{booking['title']}</p>
          <p className="modal__paragraph"><strong>Name: </strong>{booking.user.firstName} {booking.user.lastName}</p>
          <p className="modal__paragraph"><strong>Email: </strong>{booking.user && booking.user.email ? booking.user.email : 'Unknown'}</p>
          <p className="modal__paragraph"><strong>Room: </strong>{findRoomInfo(booking.roomId, props.roomData).name}{', Level '}
          {findRoomInfo(booking.roomId, props.roomData).floor}</p>
          <p className="modal__paragraph"><strong>Time: </strong>{`${momentTimezone
              .tz(booking['bookingStart'], 'Asia/Ho_Chi_Minh')
            .format('h.mma')} to ${momentTimezone
              .tz(booking['bookingEnd'], 'Asia/Ho_Chi_Minh')
              .format('h.mma')}`}
          </p>
          <p className="modal__paragraph"><strong>Date: </strong>{`${momentTimezone.tz(booking['bookingStart'], 'Asia/Ho_Chi_Minh').format('MMMM Do, YYYY')} to ${momentTimezone.tz(booking['bookingEnd'], 'Asia/Ho_Chi_Minh').format('MMMM Do, YYYY')}`}</p>
          <p className="modal__paragraph"><strong>Status: </strong>{booking['status']}</p>
          <p className="modal__paragraph"><strong>Purpose: </strong>{booking['purpose']}</p>
        </div>
      )}
      {booking && booking.user && booking.user.email ? (
        <a href={`mailto:${booking.user.email}`} className="button">Contact</a>
      ) : (
        <a href={`mailto:${props.user}`} className="button">Contact</a>
      )}
      <Button
        onClick={deleteBooking}
        text={`Delete`}
      />
      <Button
        className="button__close button--alternative"
        onClick={props.onCloseBooking}
        text={`Close`}
      />
    </ReactModal>
  )
}
export default BookingModal
