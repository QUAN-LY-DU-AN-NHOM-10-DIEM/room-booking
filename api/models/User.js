const mongoose = require('./init')
const passportLocalMongoose = require('passport-local-mongoose')
const { randomUUID } = require('crypto')

const userSchema = new mongoose.Schema({
  id: {
    type: String,
    default: () => randomUUID(),
    unique: true,
    index: true
  },
  firstName: String,
  lastName: String,
  full_name: {
    type: String,
    trim: true
  },
  avatar_url: String,
  provider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  google_sub: {
    type: String,
    sparse: true,
    unique: true,
    index: true
  },
  role: {
    type: String,
    enum: ['staff', 'admin', 'user'],
    default: 'staff',
    index: true
  },
  last_login_at: Date,
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
    lowercase: true,
    trim: true
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
})

userSchema.pre('save', function setDefaultFullName(next) {
  if (!this.full_name) {
    this.full_name = [this.firstName, this.lastName].filter(Boolean).join(' ').trim() || this.email
  }
  next()
})

userSchema.plugin(passportLocalMongoose, {
  usernameField: 'email',
  usernameLowerCase: true,
  session: false
})

const User = (module.exports = mongoose.model('User', userSchema))
