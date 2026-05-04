require('dotenv').config()
const mongoose = require('./init')
const User = require('./User')

async function fixUserRoles() {
  try {
    // Check if we are already connected via init.js or need a new connection
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI)
    }
    console.log('Successfully connected to database')

    // Find all users where role field does not exist
    const result = await User.updateMany(
      { role: { $exists: false } }, 
      { $set: { role: 'staff' } }
    )

    console.log(`Update complete! Set 'staff' role for ${result.modifiedCount || result.nModified || 0} users.`)
    process.exit(0)
  } catch (err) {
    console.error('Error during update:', err.message)
    process.exit(1)
  }
}

fixUserRoles()
