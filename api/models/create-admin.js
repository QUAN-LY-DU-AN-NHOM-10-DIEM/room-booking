require('dotenv').config()
const mongoose = require('./init')
const User = require('./User')

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI)
  
  const admin = new User({
    email: 'admin@roombooking.com',
    firstName: 'Admin',
    lastName: 'User'
  })
  
  await User.register(admin, 'admin123', (err, user) => {
    if (err) {
      console.error('Error:', err.message)
      process.exit(1)
    }
    console.log('Admin user created!')
    console.log('Email: admin@roombooking.com')
    console.log('Password: admin123')
    process.exit(0)
  })
}

createAdmin()