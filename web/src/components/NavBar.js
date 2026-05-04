import React, { Component, Fragment } from 'react'
import { Link } from 'react-router-dom'

class NavBar extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showDropdown: false
    }
  }

  toggleDropdown = () => {
    this.setState(prevState => ({
      showDropdown: !prevState.showDropdown
    }))
  }

  handleSignOut = () => {
    this.setState({ showDropdown: false })
    this.props.signOut()
  }

  render() {
    const { user } = this.props
    const { showDropdown } = this.state

    const defaultAvatar = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'
    const avatarUrl = user && user.avatar_url ? user.avatar_url : defaultAvatar
    const isAdmin = user && user.role === 'admin'

    return (
      <nav className="nav">
        <ul className="nav__list">
          <li className="nav__item">
            <Link to="/bookings" className="nav__link">
              View Room Availability
            </Link>
          </li>
          <li className="nav__item">
            <Link to="/mybookings" className="nav__link">
              My Bookings
            </Link>
          </li>
          {isAdmin && (
            <li className="nav__item">
              <Link to="/admin" className="nav__link">
                Admin Dashboard
              </Link>
            </li>
          )}
          <li className="nav__item">
            <div
              className="nav__avatar-container"
              onClick={this.toggleDropdown}
              title={user && user.full_name}
            >
              <img src={avatarUrl} alt="User Avatar" className="nav__avatar" />
              {showDropdown && (
                <div className="nav__dropdown">
                  <div className="nav__dropdown-item" onClick={this.handleSignOut}>
                    Logout
                  </div>
                </div>
              )}
            </div>
          </li>
        </ul>
      </nav>
    )
  }
}

export default NavBar