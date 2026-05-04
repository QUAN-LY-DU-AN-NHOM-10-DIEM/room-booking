import React, { Component, Fragment } from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from 'react-router-dom'
import './css/style.css'
import moment from 'moment'

import BookingForm from './components/BookingForm'
import Button from './components/Button'
import FilterElement from './components/FilterElement'
import Footer from './components/Footer'
import Key from './components/Key'
import MyBookings from './components/MyBookings'
import NavBar from './components/NavBar'
import RoomsList from './components/RoomsList'
import SignInForm from './components/SignInForm'
import SignUpForm from './components/SignUpForm'

import {
  signIn,
  signInWithGoogle,
  signOut,
  signUp
} from './api/auth'
import { listRooms } from './api/rooms'
import { getDecodedToken } from './api/token'
import { makeBooking, deleteBooking, updateStateRoom } from './api/booking'
import Calendar from './components/Calendar'
import BookingModal from './components/BookingModal'
import { floorParams, filterParams, capacityParams, onFilterByFloor, onFilterByFeature, onFilterByCapacity, onFilterByStatus } from './helpers/filters'
import { initialRoom } from './helpers/rooms'
import AdminDashboard from './components/Admin/AdminDashboard'
import { updateRoom, deleteRoom } from './api/rooms'
import { updateBookingStatus } from './api/booking'

class App extends Component {
  state = {
    decodedToken: getDecodedToken(), // retrieves the token from local storage if valid, else will be null
    roomData: null,
    userBookings: null,
    calendarDate: new Date(),
    selectedBooking: null,
    filterParams: filterParams,
    capacityParams: capacityParams,
    floorParam: 'all',
    statusParam: 'all',
    filteredData: null,
    checked: null,
    currentRoom: null,
    error: null,
    disableRecurring: true,
    isSubmitting: false,
    showSignUp: false
  }

  // Pass supplied first name, lastname, email & password to the signUp function, returns the user's token
  onSignUp = ({ firstName, lastName, email, password }) => {
    signUp({ firstName, lastName, email, password }).then(decodedToken => {
      this.setState({ decodedToken })
    })
  }

  // Pass supplied email & password to the signIn function, returns the users token
  onSignIn = ({ email, password }) => {
    signIn({ email, password }).then(decodedToken => {
      this.setState({ decodedToken })
    })
  }

  // Pass Google ID token from the client Google button to API sign in endpoint
  onGoogleSignIn = ({ idToken }) => {
    signInWithGoogle({ idToken }).then(decodedToken => {
      if (decodedToken) {
        this.setState({ decodedToken })
      }
    })
  }

  // Removes the current token from local storage
  onSignOut = () => {
    signOut()
    this.setState({ decodedToken: null })
  }

  setCalendarDate = date => {
    this.setState({ calendarDate: date })
  }

  onShowBooking = booking => {
    const selectedBooking = booking
    console.log('selectedBooking', selectedBooking)
    this.setState(() => ({ selectedBooking }))
  }

  onCloseBooking = () => {
    this.setState(() => ({ selectedBooking: null }))
  }

  // Makes a booking by updating the database and the React state
  onMakeBooking = ({ startDate, endDate, businessUnit, purpose, roomId, recurringData, title, participants }, history) => {
    this.setState({ isSubmitting: true })
    const existingBookings = this.state.currentRoom.bookings

    // Check if there is a clash and, if not, save the new booking to the database
    try {
      makeBooking(
        { startDate, endDate, businessUnit, purpose, roomId, recurringData, title, participants },
        existingBookings
      )
        .then(updatedRoom => {
          this.setState({ isSubmitting: false })
          // If the new booking is successfully saved to the database
          alert(`Your request for ${updatedRoom.name} was submitted. Status: Pending.`)
          updateStateRoom(this, updatedRoom, this.loadMyBookings)
          if (history) history.push('/bookings')
        })
        .catch(err => {
          this.setState({ isSubmitting: false })
          // If there is an error during submission
          console.error(err)
          alert(err.message || 'An error occurred while booking.')
        })
    } catch (err) {
      this.setState({ isSubmitting: false })
      // If there is a booking clash and the booking could not be saved
      alert(err.message || 'Your booking could not be saved. Please ensure it does not clash with an existing booking and that it is a valid time in the future.')
      console.log(err)
    }
  }

  // Deletes a booking from the database and updates the React state
  onDeleteBooking = (roomId, bookingId) => {
    deleteBooking(roomId, bookingId)
      .then(updatedRoom => {
        alert('Booking successfully deleted')
        updateStateRoom(
          this,
          updatedRoom,
          this.loadMyBookings,
        )
      })
      .catch(error => console.error(error.message))
  }

  // Admin Methods
  onUpdateRoom = (id, roomData) => {
    updateRoom(id, roomData)
      .then(updatedRoom => {
        alert('Room updated successfully')
        updateStateRoom(this, updatedRoom, this.loadMyBookings)
      })
      .catch(err => alert(err.message))
  }

  onHideRoom = (id) => {
    deleteRoom(id)
      .then(() => {
        alert('Room hidden successfully')
        this.load() // Reload all rooms
      })
      .catch(err => alert(err.message))
  }

  onApproveBooking = (roomId, bookingId) => {
    return updateBookingStatus(roomId, bookingId, 'Accepted')
      .then(() => {
        alert('Booking approved')
        this.load() // Reload data
      })
      .catch(err => {
        alert(err.message);
        throw err;
      })
  }

  onRejectBooking = (roomId, bookingId, reason) => {
    return updateBookingStatus(roomId, bookingId, 'Rejected', reason)
      .then(() => {
        alert('Booking rejected')
        this.load() // Reload data
      })
      .catch(err => {
        alert(err.message);
        throw err;
      })
  }

  setRoom = id => {
    const { roomData } = this.state
    if (!roomData) return
    const room = roomData.find(room => room._id === id)
    this.setState({ currentRoom: room })
  }

  // setting the feature filter parameters
  onToggleFeature = feature => {
    // Get the filter parameters
    let filterParams = this.state.filterParams
    // Find the filter parameter that matches the the passed parameter
    let featureParam = filterParams.find(param => param.name === feature)
    // Toggle the value of the parameter, eg if false, set to true
    featureParam.value = !featureParam.value
    // Set state with the updated filter parameters
    this.setState({ filterParams: filterParams })
  }

  // setting the capacity filter parameters
  onToggleCapacity = capacity => {
    // Get the capacity parameters
    let capacityParams = this.state.capacityParams
    // Find the capacity parameter that matches the the passed parameter
    let capacityParam = capacityParams.find(param => param.id === capacity)
    // Toggle the value of the parameter, eg if false, set to true
    capacityParam.value = !capacityParam.value
    // Set state with the updated capacity parameters
    this.setState({ capacityParams: capacityParams })
  }

  // changing the boolean value for the display attribute for the recurring date input
  onToggleRecurring = (value) => {
    let disableRecurring
    if (value === 'none') {
      disableRecurring = true
    } else {
      disableRecurring = false
    }
    this.setState({disableRecurring: disableRecurring})
  }

  onSetFloorParam = value => {
		this.setState({ floorParam: value })
  }

  onSetStatusParam = status => {
    this.setState({ statusParam: status })
  }

  // get today's bookings for all rooms
  oneSetCurrentDateBookings = () => {
    const currentDate = moment().format('DD-MM-YYYY')
    // const roomData = this.state.roomData
    const roomData = this.state.roomData
    // array to collect todays bookings
    let todaysBookings = []
    // loop through all rooms
    roomData.forEach(room => {
      // loop through all bookings for that room
      room.bookings.forEach(booking => {
        const bookingStart = moment(booking.bookingStart).format('DD-MM-YYYY')
        if (bookingStart === currentDate) {
          todaysBookings.push(booking)
        }
      })
    })
    console.log('todays bookings:', todaysBookings)
    // return todaysBookings
  }

  loadMyBookings = (rooms) => {
    let myBookings = []
    const roomData = rooms || this.state.roomData
    if (!roomData) return

    const userId = this.state.decodedToken.sub
    // Loop through all the rooms
    roomData.forEach(room => {
      // Loop through all the bookings in 'room'
      if (room.bookings) {
        room.bookings.forEach(booking => {
          // booking.user might be an ID or a populated object
          const bookingUserId = booking.user && (booking.user._id || booking.user)
          if (bookingUserId === userId) {
            // Add room info to the booking for display in MyBookings
            booking.roomId = room._id
            booking.roomName = room.name
            myBookings.push(booking)
          }
        })
      }
    })
    this.setState({ userBookings: myBookings })
  }

  onCreateRoom = (roomData) => {
    const { createRoom } = require('./api/rooms');
    createRoom(roomData)
      .then(room => {
        this.load();
      })
      .catch(err => alert('Failed to create room: ' + err.message));
  }

  render() {
    const {
      decodedToken,
      currentRoom,
      userBookings,
      roomData,
      calendarDate,
      selectedBooking,
      filterParams,
      capacityParams,
      floorParam,
      statusParam,
      disableRecurring,
      isSubmitting,
      loading,
      showSignUp
    } = this.state
    const signedIn = !!decodedToken
    const signOut = this.onSignOut
    const loadMyBookings = this.loadMyBookings
    const onDeleteBooking = this.onDeleteBooking
    const setCalendarDate = this.setCalendarDate
    const Loading = require('react-loading-animation')

    let filteredData = []
    const featureParams = this.state.filterParams
    const date = this.state.calendarDate

    if (!!roomData) {
      // Send all room data and the selected floor, return filtered floors and store in filteredData
      filteredData = onFilterByFloor(floorParam, roomData)
      // Send the previously filtered data along with the feature params
      filteredData = onFilterByFeature(featureParams, filteredData)
      // Send the previously filtered data along with the capacity params
      filteredData = onFilterByCapacity(capacityParams, filteredData)
      // Send the previously filtered data along with the status
      if (statusParam && statusParam !== 'all') {
        filteredData = onFilterByStatus(statusParam, filteredData, calendarDate)
      }
    }

    const requireAuth = render => (props) =>
      signedIn ? render(props) : <Redirect to="/" />

    return (
      <Router>
        <div id="app" className="App">
          <Fragment>
              <Switch>
                <Route path="/" exact render={() => (!!decodedToken && signedIn ?
                  (<Redirect to="/bookings" />) :
                  (<div className="wrapper__form">
                      {showSignUp ? (
                        <Fragment>
                          <div className="header__page">
                            <h2 className="header__heading header__heading--sub--alt">Sign up</h2>
                          </div>
                          <SignUpForm onSignUp={this.onSignUp} />
                          <h3 className="header__heading header__heading--sub--alt">Already have an account?</h3>
                          <div className="form__group--button">
                            <button className="button button--alternative" onClick={() => this.setState({ showSignUp: false })}>Sign in</button>
                          </div>
                        </Fragment>
                      ) : (
                        <Fragment>
                          <div className="header__page">
                            <h2 className="header__heading header__heading--sub--alt">Sign in with email</h2>
                          </div>
                          <SignInForm
                            onSignIn={this.onSignIn}
                            onGoogleSignIn={this.onGoogleSignIn}
                          />
                          <h3 className="header__heading header__heading--sub--alt">Don't have an account?</h3>
                          <div className="form__group--button">
                            <button className="button button--alternative" onClick={() => this.setState({ showSignUp: true })}>Sign up</button>
                          </div>
                        </Fragment>
                      )}
                    </div>
                  )
                )} />

                <Route path="/bookings" exact render={requireAuth(() => (
                  <Fragment>
                    { !!decodedToken && !roomData && loading && (
                      <div className="loading_animation">
                        <Loading />
                      </div>
                    ) }
                    {!!decodedToken && !!roomData && !loading && (
                      <div className="wrapper">
                        <div className="header header__nav header--flex">
                          <h1 className="header__heading header__heading--main">Company Name Here</h1>
                          <NavBar
                            signOut={signOut}
                            loadMyBookings={loadMyBookings}
                            user={decodedToken}
                          />
                        </div>
                        <div className="wrapper__content">
                          <div className="header__page">
                            <h2 className="header__heading header__heading--sub">Book a room | {moment(calendarDate).format('MMMM Do YYYY')}</h2>
                          </div>
                          <div className="sidebar">
                            <div className="sidebar__box">
                              <Calendar setCalendarDate={setCalendarDate} />
                            </div>
                            <div className="sidebar__box">
                              <FilterElement
                                onSetFloorParam={this.onSetFloorParam}
                                onToggleFeature={this.onToggleFeature}
                                onToggleCapacity={this.onToggleCapacity}
                                onSetStatusParam={this.onSetStatusParam}
                                filterParams={filterParams}
                                capacityParams={capacityParams}
                                floorParam={floorParam}
                                statusParam={statusParam}
                                onSetTimeFilterParams={this.onSetTimeFilterParams}
                                date={calendarDate}
                              />
                            </div>
                            <div className="sidebar__box">
                              <Key />
                            </div>
                          </div>
                          <div className="content">
                            <RoomsList
                              rooms={filteredData}
                              onRoomSelect={this.onRoomSelect}
                              onShowBooking={this.onShowBooking}
                              date={calendarDate}
                              onSetRoom={this.setRoom}
                            />
                          </div>
                         </div>
                        <BookingModal
                          selectedBooking={selectedBooking}
                          onCloseBooking={this.onCloseBooking}
                          onDeleteBooking={onDeleteBooking}
                          roomData={roomData}
                          user={decodedToken.email}
                        />
                      </div>
                    )}
                  </Fragment>
                ))} />

                <Route path="/createbooking" exact render={requireAuth(
                  (routeProps) => (
                    <Fragment>
                      {!!decodedToken &&
                        !!roomData &&
                        !!currentRoom && (
                          <div className="wrapper">
                            <header className="header header__nav header--flex">
                              <h1 className="header__heading header__heading--main">Company Name Here</h1>
                              <NavBar
                                signOut={signOut}
                                loadMyBookings={loadMyBookings}
                                user={signedIn ? decodedToken.sub : null}
                              />
                            </header>
                            <div className="wrapper__content">
                              <BookingForm
                                user={decodedToken.email}
                                roomData={currentRoom}
                                onMakeBooking={(data) => this.onMakeBooking(data, routeProps.history)}
                                date={calendarDate}
                                disableRecurring={disableRecurring}
                                isSubmitting={isSubmitting}
                                updateCalendar={setCalendarDate}
                                onShowBooking={this.onShowBooking}
                                onToggleRecurring={this.onToggleRecurring}
                              />
                            </div>
                              <BookingModal
                                selectedBooking={selectedBooking}
                                onCloseBooking={this.onCloseBooking}
                                onDeleteBooking={onDeleteBooking}
                                roomData={roomData}
                                user={decodedToken.email}
                              />
                        </div>
                      )}
                    </Fragment>
                  )
                )} />

                <Route path="/mybookings" exact render={requireAuth(() => (
                    <Fragment>
                      {!!decodedToken &&
                        !!roomData && (
                          <div className="wrapper">
                            <div className="header header__nav header--flex">
                              <h1 className="header__heading header__heading--main">Company Name Here</h1>
                              <NavBar
                                signOut={signOut}
                                loadMyBookings={loadMyBookings}
                                user={signedIn ? decodedToken.sub : null}
                              />
                            </div>
                            <div className="wrapper__content--bookings">
                              <div className="header__page">
                                <h2 className="header__heading header__heading--sub">My Bookings</h2>
                              </div>
                              <MyBookings
                                roomData={roomData}
                                user={decodedToken.email}
                                userBookings={userBookings}
                                onDeleteBooking={onDeleteBooking}
                              />
                            </div>
                          </div>
                        )}
                    </Fragment>
                  ))} />

                <Route path="/admin" exact render={requireAuth(() => (
                  <Fragment>
                    {!!decodedToken && decodedToken.role === 'admin' && !!roomData ? (
                      <div className="wrapper">
                        <div className="header header__nav header--flex">
                          <h1 className="header__heading header__heading--main">Company Name Here (Admin)</h1>
                          <NavBar
                            signOut={signOut}
                            loadMyBookings={loadMyBookings}
                            user={decodedToken}
                            isAdmin={true}
                          />
                        </div>
                        <div className="wrapper__content">
                          <AdminDashboard 
                            roomData={roomData}
                            onUpdateRoom={this.onUpdateRoom}
                            onCreateRoom={this.onCreateRoom}
                            onDeleteRoom={this.onHideRoom}
                            onApprove={this.onApproveBooking}
                            onReject={this.onRejectBooking}
                          />
                        </div>
                      </div>
                    ) : (
                      <Redirect to="/bookings" />
                    )}
                  </Fragment>
                ))} />

                <Route render={({ location }) => <h2>
                      {' '}
                      Page Not Found: {location.pathname}{' '}
                    </h2>} />
            </Switch>
          </Fragment>
        </div>
      </Router>
    )
  }

  load() {
    this.setState({ loading: true })
    const { decodedToken } = this.state
    const isAdmin = decodedToken && decodedToken.role === 'admin'
    
    listRooms(isAdmin)
      .then(rooms => {
        const { decodedToken } = this.state
        const signedIn = !!decodedToken
        
        if (signedIn) {
          this.loadMyBookings(rooms)
        }
        
        let currentRoom = null
        if (rooms && rooms.length > 0) {
          currentRoom = rooms[0]
        }
        
        this.setState({ 
          roomData: rooms,
          currentRoom: currentRoom,
          loading: false 
        })
      })
      .catch(error => {
        console.error('Error loading room data', error)
        this.setState({ error, loading: false })
      })
  }

  // When the App first renders
  componentDidMount() {
    this.load()
  }

  // When state changes
  componentDidUpdate(prevProps, prevState) {
    // If just signed in, signed up, or signed out,
    // then the token will have changed
    if (this.state.decodedToken !== prevState.decodedToken) {
      this.load()
    }
  }

}

export default App
