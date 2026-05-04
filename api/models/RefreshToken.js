const mongoose = require('./init')

const refreshTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expires_at: {
    type: Date,
    required: true,
    index: { expires: '0s' } // TTL index: auto-delete when expires_at is reached
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
})

const RefreshToken = (module.exports = mongoose.model('RefreshToken', refreshTokenSchema))
