import React, { useCallback, useEffect, useRef } from 'react'

function SignInForm({ onSignIn, onGoogleSignIn }) {
  const googleButtonContainer = useRef(null)
  const googleButtonRendered = useRef(false)

  const handleGoogleResponse = useCallback(response => {
    if (!response || !response.credential) {
      alert('Google sign in failed. Please try again.')
      return
    }

    if (onGoogleSignIn) {
      onGoogleSignIn({ idToken: response.credential })
    }
  }, [onGoogleSignIn])

  useEffect(() => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID
    const google = window.google

    if (
      googleButtonRendered.current ||
      !googleButtonContainer.current ||
      !clientId ||
      !google ||
      !google.accounts ||
      !google.accounts.id
    ) {
      return
    }

    google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleResponse,
      auto_select: true,
      itp_support: true
    })

    google.accounts.id.renderButton(googleButtonContainer.current, {
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
      width: 320
    })

    google.accounts.id.prompt() // This enables One Tap for immediate sign-in if possible

    googleButtonRendered.current = true
  }, [handleGoogleResponse])

  const handleFormSubmit = event => {
    event.preventDefault()
    const elements = event.target.elements
    const email = elements.email.value
    const password = elements.password.value
    onSignIn({ email, password })
  }

  return (
    <form className="form--signin" onSubmit={handleFormSubmit}>
      <div className="form__group">
        <label className="form__label form__label--padding">
          {'Email'}
          <input type="email" name="email" className="form__input" required />
        </label>
      </div>
      <div className="form__group">
        <label className="form__label form__label--padding">
          {'Password'}
          <input type="password" name="password" className="form__input" required />
        </label>
      </div>
      <button className="button button__form--submit">Sign in</button>

      <div className="auth-divider">or</div>
      <div className="google-signin-wrapper" ref={googleButtonContainer} />
    </form>
  )
}

export default SignInForm
