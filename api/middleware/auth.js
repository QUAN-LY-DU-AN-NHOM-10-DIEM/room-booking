const passport = require('passport')
const JWT = require('jsonwebtoken')
const PassportJWT = require('passport-jwt')
const { OAuth2Client } = require('google-auth-library')
const User = require('../models/User')
const AdminWhitelist = require('../models/AdminWhitelist')
const RefreshToken = require('../models/RefreshToken')
const { randomUUID } = require('crypto')

const jwtSecret = process.env.JWT_SECRET
const jwtAlgorithm = process.env.JWT_ALGORITHM
const jwtExpiresIn = process.env.JWT_EXPIRES_IN
const googleClientId = process.env.GOOGLE_CLIENT_ID
const allowedStaffDomain = (
  process.env.ALLOWED_STAFF_DOMAIN || 'hcmut.edu.vn'
).toLowerCase()
const googleClient = googleClientId ? new OAuth2Client(googleClientId) : null

passport.use(User.createStrategy())

const toObjectId = user => (user._id || user.id).toString()

const normalizeFullName = (firstName, lastName, fallback) => {
  const computedName = [firstName, lastName]
    .filter(Boolean)
    .join(' ')
    .trim()
  return computedName || fallback
}

const toClientUser = user => ({
  id: user.id,
  email: user.email,
  full_name: user.full_name,
  avatar_url: user.avatar_url,
  role: user.role
})

const signUp = (req, res, next) => {
  if (!req.body.email || !req.body.password) {
    res.status(400).send('No username or password provided.')
  }

  const user = new User({
    email: req.body.email,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    full_name: normalizeFullName(
      req.body.firstName,
      req.body.lastName,
      req.body.email
    ),
    provider: 'local'
  })

  User.register(user, req.body.password, (error, registeredUser) => {
    if (error) {
      return next(error)
    }
    req.user = registeredUser
    next()
  })
}

function signInWithGoogle(req, res, next) {
  if (!googleClient) {
    res.status(500).json({
      error: {
        message: 'GOOGLE_CLIENT_ID is not configured.'
      }
    })
    return
  }

  const idToken = req.body.id_token
  if (!idToken) {
    res.status(400).json({
      error: {
        message: 'id_token is required.'
      }
    })
    return
  }

  googleClient
    .verifyIdToken({
      idToken,
      audience: googleClientId
    })
    .then(ticket => {
      const payload = ticket.getPayload()

      if (!payload || !payload.email || !payload.email_verified) {
        res.status(401).json({
          error: {
            message: 'Google ID token is invalid or email is not verified.'
          }
        })
        return null
      }

      const normalizedEmail = payload.email.toLowerCase()
      const allowedSuffix = `@${allowedStaffDomain}`
      if (!normalizedEmail.endsWith(allowedSuffix)) {
        res.status(403).json({
          error: {
            message: `Only @${allowedStaffDomain} staff accounts are allowed.`
          }
        })
        return null
      }

      const firstName = payload.given_name || ''
      const lastName = payload.family_name || ''
      const fullName =
        payload.name || normalizeFullName(firstName, lastName, normalizedEmail)

      return User.findOne({ email: normalizedEmail })
        .then(user => {
          if (!user) {
            return User.create({
              email: normalizedEmail,
              firstName,
              lastName,
              full_name: fullName,
              avatar_url: payload.picture,
              provider: 'google',
              google_sub: payload.sub,
              role: 'staff',
              last_login_at: new Date()
            })
          }

          user.firstName = firstName || user.firstName
          user.lastName = lastName || user.lastName
          user.full_name = fullName || user.full_name
          user.avatar_url = payload.picture || user.avatar_url
          user.provider = 'google'
          user.google_sub = payload.sub
          user.last_login_at = new Date()
          return user
        })
        .then(user => {
          // Sync user role with admin whitelist
          return AdminWhitelist.findOne({ email: user.email.toLowerCase() })
            .then(whitelistEntry => {
              user.role = whitelistEntry ? 'admin' : 'staff'
              return user.save()
            })
        })
        .then(user => {
          if (!user) {
            return
          }

          req.user = user
          req.authResponseUser = toClientUser(user)
          next()
        })
    })
    .catch(() => {
      res.status(401).json({
        error: {
          message: 'Google ID token verification failed.'
        }
      })
    })
}

const signJWTForUser = (req, res) => {
  const user = req.user
  const payload = {
    email: user.email,
    role: user.role,
    full_name: user.full_name,
    avatar_url: user.avatar_url
  }

  const token = JWT.sign(payload, jwtSecret, {
    algorithm: jwtAlgorithm,
    expiresIn: jwtExpiresIn,
    subject: toObjectId(user)
  })

  // Generate refresh token
  const refreshTokenValue = randomUUID()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // Refresh token valid for 7 days

  RefreshToken.create({
    token: refreshTokenValue,
    user: user._id,
    expires_at: expiresAt
  }).then(() => {
    const response = {
      token,
      refresh_token: refreshTokenValue
    }
    if (req.authResponseUser) {
      response.user = req.authResponseUser
    }
    res.json(response)
  }).catch(error => {
    res.status(500).json({ error: 'Failed to create refresh token' })
  })
}

const syncRole = (req, res, next) => {
  const user = req.user
  if (!user || !user.email) return next()

  AdminWhitelist.findOne({ email: user.email.toLowerCase() })
    .then(whitelistEntry => {
      const targetRole = whitelistEntry ? 'admin' : 'staff'
      if (user.role !== targetRole) {
        user.role = targetRole
        return user.save()
      }
      return user
    })
    .then(updatedUser => {
      req.user = updatedUser
      next()
    })
    .catch(next)
}

const refresh = (req, res) => {
  const { refresh_token } = req.body
  if (!refresh_token) {
    return res.status(400).json({ error: 'Refresh token is required' })
  }

  RefreshToken.findOne({ token: refresh_token })
    .populate('user')
    .then(rt => {
      if (!rt || rt.expires_at < new Date()) {
        return res.status(401).json({ error: 'Invalid or expired refresh token' })
      }

      const user = rt.user
      const payload = {
        email: user.email,
        role: user.role,
        full_name: user.full_name,
        avatar_url: user.avatar_url
      }

      const newToken = JWT.sign(payload, jwtSecret, {
        algorithm: jwtAlgorithm,
        expiresIn: jwtExpiresIn,
        subject: toObjectId(user)
      })

      res.json({ token: newToken })
    })
    .catch(error => {
      res.status(500).json({ error: 'Internal server error' })
    })
}

passport.use(
  new PassportJWT.Strategy(
    {
      jwtFromRequest: PassportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret,
      algorithms: [jwtAlgorithm]
    },
    (payload, done) => {
      User.findById(payload.sub)
        .then(user => {
          if (user) {
            done(null, user)
          } else {
            done(null, false)
          }
        })
        .catch(error => {
          done(error, false)
        })
    }
  )
)

module.exports = {
  initialize: passport.initialize(),
  signUp,
  signInWithGoogle,
  signIn: passport.authenticate('local', { session: false }),
  requireJWT: passport.authenticate('jwt', { session: false }),
  requireAdmin: (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
      next()
    } else {
      res.status(403).json({ error: 'Admin access required.' })
    }
  },
  signJWTForUser,
  syncRole,
  refresh
}
