require('dotenv').config()
const mongoose = require('./init')
const AdminWhitelist = require('./AdminWhitelist')

const emails = [
  'admin@hcmut.edu.vn',
  'nhom10diem@hcmut.edu.vn',
  'quan.ly.du.an@hcmut.edu.vn'
]

async function seed() {
  try {
    for (const email of emails) {
      await AdminWhitelist.findOneAndUpdate(
        { email: email.toLowerCase() },
        { email: email.toLowerCase() },
        { upsert: true, new: true }
      )
    }
    console.log('Admin whitelist seeded successfully.')
    process.exit(0)
  } catch (error) {
    console.error('Error seeding admin whitelist:', error)
    process.exit(1)
  }
}

seed()
