require('dotenv').config()
const mongoose = require('../models/init')
const AdminWhitelist = require('../models/AdminWhitelist')
const RefreshToken = require('../models/RefreshToken')

async function run() {
  try {
    console.log('Starting migration 002-auth-updates-down...')

    // Drop collections (or just indexes if you want to keep data)
    // For a clean rollback, we drop the collections
    await AdminWhitelist.collection.drop().catch(e => console.log('AdminWhitelist collection not found, skipping drop.'))
    await RefreshToken.collection.drop().catch(e => console.log('RefreshToken collection not found, skipping drop.'))

    console.log('Migration 002-auth-updates-down completed successfully.')
    await mongoose.connection.close()
    process.exit(0)
  } catch (error) {
    console.error('Migration 002-auth-updates-down failed:', error)
    await mongoose.connection.close()
    process.exit(1)
  }
}

run()
