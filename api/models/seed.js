require('dotenv').config()
const Room = require('./Room')
const moment = require('moment-timezone')

Room.create([
  // Level 8
  {
    name: 'Room 1',
    floor: '8',
    capacity: 18,
    assets: {
      pcLab: true
    }
  },
  {
    name: 'Room 2',
    floor: '8',
    capacity: 18,
    assets: {
      projector: true
    }
  },
  {
    name: 'Room 3',
    floor: '8',
    capacity: 18,
    assets: {
      projector: true,
      opWalls: true
    }
  },
  {
    name: 'Room 4',
    floor: '8',
    capacity: 24
  },
  {
    name: 'Room 5',
    floor: '8',
    capacity: 18,
    assets: {
      opWalls: true
    }
  },
  {
    name: 'Room 6',
    floor: '8',
    capacity: 18
  },
  {
    name: 'Room 7',
    floor: '8',
    capacity: 18
  },
  {
    name: 'Room 8',
    floor: '8',
    capacity: 18
  },
  {
    name: 'Room 9',
    floor: '8',
    capacity: 18
  },
  {
    name: 'Room 10',
    floor: '8',
    capacity: 18
  },
  {
    name: 'Room 11',
    floor: '8',
    capacity: 18
  },
  {
    name: 'Room 12',
    floor: '8',
    capacity: 18,
    assets: {
      tv: true
    }
  },
  {
    name: 'Room 13',
    floor: '8',
    capacity: 18
  },
  {
    name: 'Room 14',
    floor: '8',
    capacity: 18,
    assets: {
      tv: true
    }
  },
  {
    name: 'Room 15',
    floor: '8',
    capacity: 18,
    assets: {
      tv: true
    }
  },
  {
    name: 'Studio 11',
    floor: '8',
    capacity: 18
  },
  {
    name: 'Studio 12',
    floor: '8',
    capacity: 18
  },
  {
    name: 'Studio 13',
    floor: '8',
    capacity: 18
  },
  {
    name: 'Studio 14',
    floor: '8',
    capacity: 18
  },
  {
    name: 'Studio 15',
    floor: '8',
    capacity: 18
  },
  {
    name: 'Lab 01',
    floor: '8',
    capacity: 20,
    assets: {
      macLab: true
    }
  },
  // Level 13
  {
    name: 'Room 1',
    floor: '13',
    capacity: 20,
    assets: {
      opWalls: true
    }
  },
  {
    name: 'Room 2',
    floor: '13',
    capacity: 20,
    assets: {
      opWalls: true
    }
  },
  {
    name: 'Room 3',
    floor: '13',
    capacity: 20,
    assets: {
      opWalls: true
    }
  },
  {
    name: 'Room 4',
    floor: '13',
    capacity: 20,
    assets: {
      projector: true,
      opWalls: true
    }
  },
  {
    name: 'Room 5',
    floor: '13',
    capacity: 20,
    assets: {
      projector: true
    }
  },
  {
    name: 'Room 6',
    floor: '13',
    capacity: 20,
    assets: {
      projector: true
    }
  },
  {
    name: 'Room 7',
    floor: '13',
    capacity: 20,
    assets: {
      projector: true
    }
  },
  {
    name: 'Room 8/9',
    floor: '13',
    capacity: 40,
    assets: {
      projector: true
    }
  },
  {
    name: 'Room 10',
    floor: '13',
    capacity: 16
  },
  {
    name: 'Room 11',
    floor: '13',
    capacity: 20
  },
  {
    name: 'Room 12',
    floor: '13',
    capacity: 20
  },
  {
    name: 'Room 13',
    floor: '13',
    capacity: 20,
    assets: {
      macLab: true
    }
  },
  {
    name: 'Room 14',
    floor: '13',
    capacity: 20,
    assets: {
      pcLab: true
    }
  },
  {
    name: 'Room 15',
    floor: '13',
    capacity: 20,
    assets: {
      pcLab: true
    }
  },
  {
    name: 'Room 16',
    floor: '13',
    capacity: 20,
    assets: {
      pcLab: true
    }
  },
  {
    name: 'Room 17',
    floor: '13',
    capacity: 20
  },
  {
    name: 'Room 18',
    floor: '13',
    capacity: 20
  },
  {
    name: 'Green Screen Room',
    floor: '13',
    capacity: null,
    assets: {
      tv: true
    }
  }
])
  .then((rooms) => {
    console.log(`Created ${rooms.length} rooms.`)
    
    // Add sample bookings for testing stats
    const now = moment().tz('Australia/Sydney')
    const userId = '507f1f77bcf86cd799439011' // Sample user ID
    const sampleBookings = []
    
    // Create bookings for first 5 rooms
    for (let i = 0; i < 5; i++) {
      const room = rooms[i]
      
      // Add 3-5 bookings per room in current month
      for (let j = 0; j < Math.floor(Math.random() * 3) + 3; j++) {
        const bookingDay = Math.floor(Math.random() * 20) + 1 // Days 1-20 of month
        const bookingDate = now.clone().date(bookingDay).startOf('day')
        const startHour = Math.floor(Math.random() * 6) + 8 // 8am-2pm
        const duration = Math.floor(Math.random() * 2) + 1 // 1-2 hours
        
        sampleBookings.push({
          user: userId,
          bookingStart: bookingDate.clone().hour(startHour).toDate(),
          bookingEnd: bookingDate.clone().hour(startHour + duration).toDate(),
          startHour: `${startHour}.00`,
          duration: duration,
          recurring: [],
          businessUnit: 'Engineering',
          purpose: 'Team Meeting'
        })
      }
    }
    
    // Add bookings to rooms
    let updateCount = 0
    rooms.forEach((room, index) => {
      if (index < 5) {
        const bookingsForRoom = sampleBookings.filter((_, idx) => {
          const roomsPerBooking = Math.ceil(sampleBookings.length / 5)
          return idx >= index * roomsPerBooking && idx < (index + 1) * roomsPerBooking
        })
        
        room.bookings = bookingsForRoom
        room.save()
          .then(() => {
            updateCount++
            if (updateCount === 5) {
              console.log(`Added ${sampleBookings.length} sample bookings for testing stats.`)
            }
          })
          .catch(err => console.error('Error saving room bookings:', err))
      }
    })
  })
  .catch((error) => {
    console.error(error)
  })