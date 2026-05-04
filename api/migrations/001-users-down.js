require('dotenv').config()
const mongoose = require('../models/init')
const User = require('../models/User')

Promise.resolve()
  .then(() => User.collection.dropIndex('users_email_unique').catch(() => {}))
  .then(() => User.collection.dropIndex('users_google_sub_unique_sparse').catch(() => {}))
  .then(() => User.collection.dropIndex('users_role_created_at_index').catch(() => {}))
  .then(() => {
    console.log('Migration down completed successfully.')
    return mongoose.connection.close()
  })
  .then(() => {
    process.exit(0)
  })
  .catch(error => {
    console.error('Migration down failed:', error)
    mongoose.connection.close().then(() => process.exit(1))
  })
