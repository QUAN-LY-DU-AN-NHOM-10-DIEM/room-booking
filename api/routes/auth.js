const express = require('express')
const {
  signUp,
  signIn,
  signInWithGoogle,
  signJWTForUser,
  syncRole,
  refresh
} = require('../middleware/auth')

const router = new express.Router()

// Sign up
router.post('/auth/sign-up', signUp, syncRole, signJWTForUser)

// Sign in
router.post('/auth', signIn, syncRole, signJWTForUser)

// Google sign in (ID token from client)
router.post('/api/v1/auth/google', signInWithGoogle, signJWTForUser)

// Refresh token
router.post('/auth/refresh', refresh)

module.exports = router
