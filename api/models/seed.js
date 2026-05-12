require('dotenv').config()
const mongoose = require('./init')
const Room = require('./Room')
const User = require('./User')
const AdminWhitelist = require('./AdminWhitelist')
const RefreshToken = require('./RefreshToken')
const moment = require('moment-timezone')
const { randomUUID } = require('crypto')

async function run() {
  try {
    // --- Migration: normalize users ---
    await User.updateMany(
      { role: { $exists: false } },
      { $set: { role: 'staff' } }
    )
    await User.updateMany({ role: 'Staff' }, { $set: { role: 'staff' } })
    await User.updateMany({ role: 'Admin' }, { $set: { role: 'admin' } })
    await User.updateMany({ role: 'User' }, { $set: { role: 'user' } })

    const usersWithoutId = await User.find({
      $or: [{ id: { $exists: false } }, { id: null }, { id: '' }]
    })
    for (const user of usersWithoutId) {
      user.id = randomUUID()
      await user.save()
    }

    await User.updateMany(
      { created_at: { $exists: false } },
      { $set: { created_at: new Date() } }
    )

    // Rebuild user indexes
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
    console.log('User migration completed.')

    // --- Migration: AdminWhitelist & RefreshToken indexes ---
    try { await AdminWhitelist.collection.dropIndex('email_1') } catch (e) {}
    await AdminWhitelist.collection.createIndex(
      { email: 1 },
      { unique: true, name: 'admin_whitelist_email_unique' }
    )

    try { await RefreshToken.collection.dropIndex('token_1') } catch (e) {}
    await RefreshToken.collection.createIndex(
      { token: 1 },
      { unique: true, name: 'refresh_token_unique' }
    )
    try { await RefreshToken.collection.dropIndex('expires_at_1') } catch (e) {}
    await RefreshToken.collection.createIndex(
      { expires_at: 1 },
      { expireAfterSeconds: 0, name: 'refresh_token_expiry_ttl' }
    )
    console.log('Auth migration completed.')

    // --- Seed admin whitelist ---
    const emails = [
      'admin@hcmut.edu.vn',
      'nhom10diem@hcmut.edu.vn',
      'quan.ly.du.an@hcmut.edu.vn'
    ]
    for (const email of emails) {
      await AdminWhitelist.findOneAndUpdate(
        { email: email.toLowerCase() },
        { email: email.toLowerCase() },
        { upsert: true, new: true }
      )
    }
    console.log('Admin whitelist seeded.')

    // --- Seed rooms ---
    await Room.deleteMany({})
    await Room.create([
      // Level 8
      { name: 'Room 1', floor: '8', capacity: 18, assets: { pcLab: true } },
      { name: 'Room 2', floor: '8', capacity: 18, assets: { projector: true } },
      { name: 'Room 3', floor: '8', capacity: 18, assets: { projector: true, opWalls: true } },
      { name: 'Room 4', floor: '8', capacity: 24 },
      { name: 'Room 5', floor: '8', capacity: 18, assets: { opWalls: true } },
      { name: 'Room 6', floor: '8', capacity: 18 },
      { name: 'Room 7', floor: '8', capacity: 18 },
      { name: 'Room 8', floor: '8', capacity: 18 },
      { name: 'Room 9', floor: '8', capacity: 18 },
      { name: 'Room 10', floor: '8', capacity: 18 },
      { name: 'Room 11', floor: '8', capacity: 18 },
      { name: 'Room 12', floor: '8', capacity: 18, assets: { tv: true } },
      { name: 'Room 13', floor: '8', capacity: 18 },
      { name: 'Room 14', floor: '8', capacity: 18, assets: { tv: true } },
      { name: 'Room 15', floor: '8', capacity: 18, assets: { tv: true } },
      { name: 'Studio 11', floor: '8', capacity: 18 },
      { name: 'Studio 12', floor: '8', capacity: 18 },
      { name: 'Studio 13', floor: '8', capacity: 18 },
      { name: 'Studio 14', floor: '8', capacity: 18 },
      { name: 'Studio 15', floor: '8', capacity: 18 },
      { name: 'Lab 01', floor: '8', capacity: 20, assets: { macLab: true } },
      // Level 13
      { name: 'Room 1', floor: '13', capacity: 20, assets: { opWalls: true } },
      { name: 'Room 2', floor: '13', capacity: 20, assets: { opWalls: true } },
      { name: 'Room 3', floor: '13', capacity: 20, assets: { opWalls: true } },
      { name: 'Room 4', floor: '13', capacity: 20, assets: { projector: true, opWalls: true } },
      { name: 'Room 5', floor: '13', capacity: 20, assets: { projector: true } },
      { name: 'Room 6', floor: '13', capacity: 20, assets: { projector: true } },
      { name: 'Room 7', floor: '13', capacity: 20, assets: { projector: true } },
      { name: 'Room 8/9', floor: '13', capacity: 40, assets: { projector: true } },
      { name: 'Room 10', floor: '13', capacity: 16 },
      { name: 'Room 11', floor: '13', capacity: 20 },
      { name: 'Room 12', floor: '13', capacity: 20 },
      { name: 'Room 13', floor: '13', capacity: 20, assets: { macLab: true } },
      { name: 'Room 14', floor: '13', capacity: 20, assets: { pcLab: true } },
      { name: 'Room 15', floor: '13', capacity: 20, assets: { pcLab: true } },
      { name: 'Room 16', floor: '13', capacity: 20, assets: { pcLab: true } },
      { name: 'Room 17', floor: '13', capacity: 20 },
      { name: 'Room 18', floor: '13', capacity: 20 },
      { name: 'Green Screen Room', floor: '13', capacity: null, assets: { tv: true } }
    ])

    console.log('Rooms seeded.')

    await mongoose.connection.close()
    process.exit(0)
  } catch (error) {
    console.error('Seed failed:', error)
    await mongoose.connection.close()
    process.exit(1)
  }
}

run()
