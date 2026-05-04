require('dotenv').config()
const mongoose = require('../models/init')
const User = require('../models/User')
const { randomUUID } = require('crypto')

async function run() {
  try {
    // Ensure existing records are normalized before creating strict indexes.
    await User.updateMany(
      { role: { $exists: false } },
      { $set: { role: 'staff' } }
    )
    await User.updateMany({ role: 'Staff' }, { $set: { role: 'staff' } })
    await User.updateMany({ role: 'Admin' }, { $set: { role: 'admin' } })
    await User.updateMany({ role: 'User' }, { $set: { role: 'user' } })

    const usersWithoutId = await User.find({
      $or: [
        { id: { $exists: false } },
        { id: null },
        { id: '' }
      ]
    })

    for (const user of usersWithoutId) {
      user.id = randomUUID()
      await user.save()
    }

    await User.updateMany(
      { created_at: { $exists: false } },
      { $set: { created_at: new Date() } }
    )

    // Drop existing indexes to avoid conflicts with specific names
    try { await User.collection.dropIndex('email_1') } catch (e) {}
    try { await User.collection.dropIndex('users_email_unique') } catch (e) {}
    try { await User.collection.dropIndex('google_sub_1') } catch (e) {}
    try { await User.collection.dropIndex('users_google_sub_unique_sparse') } catch (e) {}
    try { await User.collection.dropIndex('role_1_created_at_-1') } catch (e) {}
    try { await User.collection.dropIndex('users_role_created_at_index') } catch (e) {}

    await User.collection.createIndex(
      { email: 1 },
      { unique: true, name: 'users_email_unique' }
    )
    await User.collection.createIndex(
      { google_sub: 1 },
      { unique: true, sparse: true, name: 'users_google_sub_unique_sparse' }
    )
    await User.collection.createIndex(
      { role: 1, created_at: -1 },
      { name: 'users_role_created_at_index' }
    )

    console.log('Migration up completed successfully.')
    await mongoose.connection.close()
    process.exit(0)
  } catch (error) {
    console.error('Migration up failed:', error)
    await mongoose.connection.close()
    process.exit(1)
  }
}

run()
