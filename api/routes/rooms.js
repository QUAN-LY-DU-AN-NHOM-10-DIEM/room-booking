const express = require('express')
const moment = require('moment')
const momentTimezone = require('moment-timezone')
const Room = require('../models/Room')
const { requireJWT, requireAdmin } = require('../middleware/auth')

const router = new express.Router()

router.get('/rooms', (req, res) => {
<<<<<<< HEAD
  const filter = req.query.all === 'true' ? {} : { isDeleted: { $ne: true } }
  Room.find(filter)
    .populate('bookings.user', 'firstName lastName email')
=======
  Room.find()
    // .populate('bookings.user', 'firstName lastName email')
>>>>>>> 43b5c4c98757d968103feaa0b95098882d7c9266
    .then(rooms => {
      res.json(rooms)
    })
    .catch(error => {
      res.json({ error })
    })
})

router.post('/rooms', requireJWT, requireAdmin, (req, res) => {
  Room.create(req.body)
    .then(room => {
      res.status(201).json(room)
    })
    .catch(error => {
      res.status(400).json({ error })
    })
})

// Function to convert UTC JS Date object to a Moment.js object in AEST
const dateAEST = date => {
  return momentTimezone(date).tz('Asia/Ho_Chi_Minh')
}

// Function to calculate the duration of the hours between the start and end of the booking
const durationHours = (bookingStart, bookingEnd) => {
  // convert the UTC Date objects to Moment.js objeccts
  let startDateLocal = dateAEST(bookingStart)
  let endDateLocal = dateAEST(bookingEnd)
  // calculate the duration of the difference between the two times
  let difference = moment.duration(endDateLocal.diff(startDateLocal))
  // return the difference in decimal format
  return difference.hours() + difference.minutes() / 60
}

// Make a booking
router.put('/rooms/:id', requireJWT, (req, res) => {
  const { id } = req.params

  // If the recurring array is empty, the booking is not recurring
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

  // If the booking is a recurring booking
  } else {
    
    // The first booking in the recurring booking range
    let firstBooking = req.body
    firstBooking.user = req.user    
    firstBooking.startHour = dateAEST(req.body.bookingStart).format('H.mm')
    firstBooking.duration = durationHours(req.body.bookingStart, req.body.bookingEnd)
    
    // An array containing the first booking, to which all additional bookings in the recurring range will be added
    let recurringBookings = [ firstBooking ]
    
    // A Moment.js object to track each date in the recurring range, initialised with the first date
    let bookingDateTracker = momentTimezone(firstBooking.bookingStart).tz('Asia/Ho_Chi_Minh')
    
    // A Moment.js date object for the final booking date in the recurring booking range - set to one hour ahead of the first booking - to calculate the number of days/weeks/months between the first and last bookings when rounded down
    let lastBookingDate = momentTimezone(firstBooking.recurring[0]).tz('Asia/Ho_Chi_Minh')
    lastBookingDate.hour(bookingDateTracker.hour() + 1)
    
    // The number of subsequent bookings in the recurring booking date range 
    let bookingsInRange = req.body.recurring[1] === 'daily' ? 
                          Math.floor(lastBookingDate.diff(bookingDateTracker, 'days', true)) :
                          req.body.recurring[1] === 'weekly' ?
                          Math.floor(lastBookingDate.diff(bookingDateTracker, 'weeks', true)) :
                          Math.floor(lastBookingDate.diff(bookingDateTracker, 'months', true))

    // Set the units which will be added to the bookingDateTracker - days, weeks or months
    let units = req.body.recurring[1] === 'daily' ? 'd' : 
                req.body.recurring[1] === 'weekly' ? 'w' : 'M'
    
    // Each loop will represent a potential booking in this range 
    for (let i = 0; i < bookingsInRange; i++) {
      
      // Add one unit to the booking tracker to get the date of the potential booking
      let proposedBookingDateStart = bookingDateTracker.add(1, units)
    
      // Check whether this day is a Sunday (no bookings on Sundays)
      if (proposedBookingDateStart.day() !== 0) {
        
        // Create a new booking object based on the first booking 
        let newBooking = Object.assign({}, firstBooking)
        
        // Calculate the end date/time of the new booking by adding the number of units to the first booking's end date/time
        let firstBookingEndDate = momentTimezone(firstBooking.bookingEnd).tz('Asia/Ho_Chi_Minh')
        let proposedBookingDateEnd = firstBookingEndDate.add(i + 1, units)
        
        // Update the new booking object's start and end dates
        newBooking.bookingStart = proposedBookingDateStart.toDate()
        newBooking.bookingEnd = proposedBookingDateEnd.toDate()
        
        // Add the new booking to the recurring booking array
        recurringBookings.push(newBooking)
      }
    }
    

    // Handle concurrency for recurring bookings
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
    .then(room => {
      res.status(201).json(room)
    })
    .catch(error => {
      res.status(400).json({ error })
    })
})

// Update a room (Admin only)
router.patch('/rooms/:id', requireJWT, requireAdmin, (req, res) => {
  const { id } = req.params
  Room.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
    .then(room => {
      if (!room) return res.status(404).json({ error: 'Room not found' })
      res.json(room)
    })
    .catch(error => res.status(400).json({ error }))
})
 
// Soft delete a room (Admin only)
router.delete('/rooms/:id', requireJWT, requireAdmin, (req, res) => {
  const { id } = req.params
  Room.findByIdAndUpdate(id, { isDeleted: true }, { new: true })
    .then(room => {
      if (!room) return res.status(404).json({ error: 'Room not found' })
      res.json({ message: 'Room hidden successfully', room })
    })
    .catch(error => res.status(400).json({ error }))
})
 
// Get all pending bookings (Admin only)
router.get('/admin/bookings/pending', requireJWT, requireAdmin, (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const skip = (page - 1) * limit
 
  Room.aggregate([
    { $unwind: '$bookings' },
    { $match: { 'bookings.status': 'Pending' } },
    {
      $lookup: {
        from: 'users',
        localField: 'bookings.user',
        foreignField: '_id',
        as: 'user_details'
      }
    },
    { $unwind: '$user_details' },
    {
      $project: {
        _id: 1,
        roomName: '$name',
        booking: '$bookings',
        user: {
          firstName: '$user_details.firstName',
          lastName: '$user_details.lastName',
          email: '$user_details.email'
        }
      }
    },
    { $sort: { 'booking.bookingStart': 1 } },
    {
      $facet: {
        metadata: [{ $count: 'total' }],
        data: [{ $skip: skip }, { $limit: limit }]
      }
    }
  ])
    .then(results => {
      const data = results[0].data
      const total = results[0].metadata[0] ? results[0].metadata[0].total : 0
      res.json({
        bookings: data,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit)
        }
      })
    })
    .catch(error => res.status(400).json({ error }))
})
 
// Approve/Reject a booking (Admin only)
router.patch('/admin/bookings/:roomId/:bookingId', requireJWT, requireAdmin, (req, res) => {
  const { roomId, bookingId } = req.params
  const { status, rejectionReason } = req.body
 
  if (!['Accepted', 'Rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' })
  }
 
  Room.findOneAndUpdate(
    { _id: roomId, 'bookings._id': bookingId },
    {
      $set: {
        'bookings.$.status': status,
        'bookings.$.rejectionReason': rejectionReason || ''
      }
    },
    { new: true }
  )
    .then(room => {
      if (!room) return res.status(404).json({ error: 'Booking not found' })
      res.json(room)
    })
    .catch(error => res.status(400).json({ error }))
})
 
// Maintenance block (Admin only)
router.post('/admin/maintenance/:id', requireJWT, requireAdmin, (req, res) => {
  const { id } = req.params
  const { bookingStart, bookingEnd, title } = req.body
 
  Room.findByIdAndUpdate(
    id,
    {
      $push: {
        bookings: {
          bookingStart: new Date(bookingStart),
          bookingEnd: new Date(bookingEnd),
          startHour: dateAEST(bookingStart).format('H.mm'),
          duration: durationHours(bookingStart, bookingEnd),
          status: 'Maintenance',
          title: title || 'Maintenance',
          businessUnit: 'ADMIN',
          purpose: 'Maintenance'
        }
      }
    },
    { new: true }
  )
    .then(room => res.status(201).json(room))
    .catch(error => res.status(400).json({ error }))
})

module.exports = router
