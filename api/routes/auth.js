const express = require('express')
const {
  signUp,
  signIn,
  signInWithGoogle,
  signJWTForUser,
  refresh
} = require('../middleware/auth')

const router = new express.Router()

// Sign up
router.post('/auth/sign-up', signUp, signJWTForUser)

// Sign in
router.post('/auth', signIn, signJWTForUser)

// Google sign in (ID token from client)
router.post('/api/v1/auth/google', signInWithGoogle, signJWTForUser)

// Refresh token
router.post('/auth/refresh', refresh)

module.exports = router
