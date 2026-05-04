const express = require('express')
const moment = require('moment')
const momentTimezone = require('moment-timezone')
const Room = require('../models/Room')
const { requireJWT } = require('../middleware/auth')

const router = new express.Router()

router.get('/rooms', (req, res) => {
  Room.find()
    .populate('bookings.user', 'firstName lastName email')
    .then(rooms => {
      res.json(rooms)
    })
    .catch(error => {
      res.json({ error })
    })
})

router.post('/rooms', requireJWT, (req, res) => {
  Room.create(req.body)
    .then(room => {
      res.status(201).json(room)
    })
    .catch(error => {
      res.status(400).json({ error })
    })
})

const dateAEST = date => {
  return momentTimezone(date).tz('Asia/Ho_Chi_Minh')
}

const durationHours = (bookingStart, bookingEnd) => {
  let startDateLocal = dateAEST(bookingStart)
  let endDateLocal = dateAEST(bookingEnd)
  let difference = moment.duration(endDateLocal.diff(startDateLocal))
  return difference.hours() + difference.minutes() / 60
}

// Make a booking
router.put('/rooms/:id', requireJWT, (req, res) => {
  const { id } = req.params

  if (req.body.recurring.length === 0) {
    const bookingStartDate = new Date(req.body.bookingStart);
    const bookingEndDate = new Date(req.body.bookingEnd);

    Room.findOneAndUpdate(
      {
        _id: id,
        bookings: {
          $not: {
            $elemMatch: {
              status: { $in: ['Pending', 'Accepted'] },
              bookingStart: { $lt: bookingEndDate },
              bookingEnd: { $gt: bookingStartDate }
            }
          }
        }
      },
      {
        $push: {
          bookings: {
            user: req.user,
            startHour: dateAEST(req.body.bookingStart).format('H.mm'),
            duration: durationHours(req.body.bookingStart, req.body.bookingEnd),
            status: 'Pending',
            title: req.body.title || 'Meeting',
            participants: req.body.participants || 1,
            ...req.body
          }
        }
      },
      { new: true, runValidators: true }
    )
      .populate('bookings.user', 'firstName lastName email')  
      .then(room => {
        if (!room) {
          Room.findById(id).then(existingRoom => {
            if (!existingRoom) {
              return res.status(404).json({ error: 'Room not found' });
            }
            return res.status(409).json({ error: 'Khung giờ này vừa được người khác đặt.' });
          });
        } else {
          res.status(201).json(room)
        }
      })
      .catch(error => {
        res.status(400).json({ error: error.message || error })
      })

  } else {
    
    let firstBooking = req.body
    firstBooking.user = req.user    
    firstBooking.startHour = dateAEST(req.body.bookingStart).format('H.mm')
    firstBooking.duration = durationHours(req.body.bookingStart, req.body.bookingEnd)
    
    let recurringBookings = [ firstBooking ]
    let bookingDateTracker = momentTimezone(firstBooking.bookingStart).tz('Asia/Ho_Chi_Minh')
    let lastBookingDate = momentTimezone(firstBooking.recurring[0]).tz('Asia/Ho_Chi_Minh')
    lastBookingDate.hour(bookingDateTracker.hour() + 1)
    
    let bookingsInRange = req.body.recurring[1] === 'daily' ? 
                          Math.floor(lastBookingDate.diff(bookingDateTracker, 'days', true)) :
                          req.body.recurring[1] === 'weekly' ?
                          Math.floor(lastBookingDate.diff(bookingDateTracker, 'weeks', true)) :
                          Math.floor(lastBookingDate.diff(bookingDateTracker, 'months', true))

    let units = req.body.recurring[1] === 'daily' ? 'd' : 
                req.body.recurring[1] === 'weekly' ? 'w' : 'M'
    
    for (let i = 0; i < bookingsInRange; i++) {
      let proposedBookingDateStart = bookingDateTracker.add(1, units)
      if (proposedBookingDateStart.day() !== 0) {
        let newBooking = Object.assign({}, firstBooking)
        let firstBookingEndDate = momentTimezone(firstBooking.bookingEnd).tz('Asia/Ho_Chi_Minh')
        let proposedBookingDateEnd = firstBookingEndDate.add(i + 1, units)
        newBooking.bookingStart = proposedBookingDateStart.toDate()
        newBooking.bookingEnd = proposedBookingDateEnd.toDate()
        recurringBookings.push(newBooking)
      }
    }

    Room.findById(id).then(room => {
      if (!room) return res.status(404).json({ error: 'Room not found' });
      
      const hasClash = recurringBookings.some(newBooking => {
        return room.bookings.some(existing => {
          if (['Failed'].includes(existing.status)) return false;
          const eStart = new Date(existing.bookingStart);
          const eEnd = new Date(existing.bookingEnd);
          const nStart = new Date(newBooking.bookingStart);
          const nEnd = new Date(newBooking.bookingEnd);
          return (nStart < eEnd && nEnd > eStart);
        });
      });

      if (hasClash) {
        return res.status(409).json({ error: 'Khung giờ này vừa được người khác đặt.' });
      }

      room.bookings.push(...recurringBookings.map(b => ({
        ...b, 
        status: 'Pending',
        title: req.body.title || 'Meeting',
        participants: req.body.participants || 1
      })));
      
      room.save()
        .then(savedRoom => savedRoom.populate('bookings.user', 'firstName lastName email')) 
        .then(populatedRoom => res.status(201).json(populatedRoom))
        .catch(error => res.status(400).json({ error: error.message || error }));
    }).catch(error => res.status(400).json({ error: error.message || error }));
  }
})

// Delete a booking
router.delete('/rooms/:id/:bookingId', requireJWT, (req, res) => {
  const { id } = req.params
  const { bookingId } = req.params
  Room.findByIdAndUpdate(
    id,
    { $pull: { bookings: { _id: bookingId } } },
    { new: true }
  )
    .populate('bookings.user', 'firstName lastName email') 
    .then(room => {
      res.status(201).json(room)
    })
    .catch(error => {
      res.status(400).json({ error })
    })
})

module.exports = router