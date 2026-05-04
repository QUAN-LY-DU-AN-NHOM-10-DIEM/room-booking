// For storing the logged in user's credentails across page refreshes
import decodeJWT from 'jwt-decode'
const key = 'userToken'
const refreshKey = 'refreshToken'

export function rememberToken(token) {
  if (token) {
    localStorage.setItem(key, token)
  }
  else {
    localStorage.removeItem(key)
  }
}

export function rememberRefreshToken(token) {
  if (token) {
    localStorage.setItem(refreshKey, token)
  }
  else {
    localStorage.removeItem(refreshKey)
  }
}

export function getRefreshToken() {
  return localStorage.getItem(refreshKey)
}

export function getValidToken() {
  const token = localStorage.getItem(key) 
  try {
    const decodedToken = decodeJWT(token)
    // valid token
    const now = Date.now() / 1000
    // check if token has expired
    if (now > decodedToken.exp) {
      return null
    }
    return token
  }
  catch (error) {
    // invalid token
    return null
  }
}

export function getDecodedToken() {
  const validToken = getValidToken()
  if (validToken) {
    return decodeJWT(validToken)
  }
  else {
    return null
  }
}