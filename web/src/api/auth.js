import api, { setToken } from './init'
import { getDecodedToken } from './token'

// Sends a POST request to /auth/sign-up on the server, with first name, last name, email & password registering the user and returning the JWT
export function signUp({ firstName, lastName, email, password }) {
  return api.post('/auth/sign-up', { firstName, lastName, email, password })
    .then(res => {
      const { token, refresh_token } = res.data
      setToken(token, refresh_token)
      return getDecodedToken()
    })
}

// Sends a POST request to /auth on the server, with the email & password returning the JWT
// Belonging to the user with supplied credentials
export function signIn({ email, password }) {
  return api.post('/auth', { email, password })
    .then(res => {
      const { token, refresh_token } = res.data
      setToken(token, refresh_token)
      return getDecodedToken()
    })
    .catch(res => {
      if (res.response && (res.response.status === 400 || res.response.status === 401)) {
        alert("There was an error with your email or password. Please try again.")
      }
    })
}

// Sends a POST request to /api/v1/auth/google with a Google ID token and returns the internal JWT.
export function signInWithGoogle({ idToken }) {
  return api.post('/api/v1/auth/google', { id_token: idToken })
    .then(res => {
      const { token, refresh_token } = res.data
      setToken(token, refresh_token)
      return getDecodedToken()
    })
    .catch(res => {
      if (!res.response || !res.response.status) {
        alert('Google sign in failed. Please try again.')
        return
      }

      if (res.response.status === 403) {
        alert('Only @hcmut.edu.vn staff accounts are allowed.')
      } else if (res.response.status === 400 || res.response.status === 401) {
        alert('Google token is invalid or expired. Please sign in again.')
      } else {
        alert('Google sign in failed. Please try again.')
      }
    })
}

export function signOut() {
  setToken(null)
}
