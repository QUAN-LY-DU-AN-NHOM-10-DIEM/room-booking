require('dotenv').config()
const mongoose = require('../models/init')
const AdminWhitelist = require('../models/AdminWhitelist')
const RefreshToken = require('../models/RefreshToken')

async function run() {
  try {
    console.log('Starting migration 002-auth-updates-up...')

    // Create indexes for AdminWhitelist
    try { await AdminWhitelist.collection.dropIndex('email_1') } catch (e) {}
    await AdminWhitelist.collection.createIndex(
      { email: 1 },
      { unique: true, name: 'admin_whitelist_email_unique' }
    )

    // Create indexes for RefreshToken
    try { await RefreshToken.collection.dropIndex('token_1') } catch (e) {}
    await RefreshToken.collection.createIndex(
      { token: 1 },
      { unique: true, name: 'refresh_token_unique' }
    )

    // TTL index for automatic expiration
    try { await RefreshToken.collection.dropIndex('expires_at_1') } catch (e) {}
    await RefreshToken.collection.createIndex(
      { expires_at: 1 },
      { expireAfterSeconds: 0, name: 'refresh_token_expiry_ttl' }
    )

    // Seed some initial admins if whitelist is empty
    const count = await AdminWhitelist.countDocuments()
    if (count === 0) {
      const defaultAdmins = [
        'admin@hcmut.edu.vn',
        'nhom10diem@hcmut.edu.vn'
      ]
      for (const email of defaultAdmins) {
        await AdminWhitelist.create({ email: email.toLowerCase() })
      }
      console.log('Seeded default admin emails.')
    }

    console.log('Migration 002-auth-updates-up completed successfully.')
    await mongoose.connection.close()
    process.exit(0)
  } catch (error) {
    console.error('Migration 002-auth-updates-up failed:', error)
    await mongoose.connection.close()
    process.exit(1)
  }
}

run()
