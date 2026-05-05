// Updated PendingRequests component
import React, { Component } from 'react';
import { listPendingBookings } from '../../api/booking';
import moment from 'moment';

class PendingRequests extends Component {
  state = {
    bookings: [],
    pagination: {},
    currentPage: 1,
    loading: false
  };

  componentDidMount() {
    this.loadBookings();
  }

  loadBookings = (page = 1) => {
    this.setState({ loading: true });
    listPendingBookings(page)
      .then(res => {
        this.setState({
          bookings: res.bookings,
          pagination: res.pagination,
          currentPage: page,
          loading: false
        });
      })
      .catch(() => this.setState({ loading: false }));
  }

  handleApprove = (roomId, bookingId) => {
    this.setState({ loading: true });
    this.props.onApprove(roomId, bookingId)
      .then(() => this.loadBookings(this.state.currentPage))
      .catch(() => this.setState({ loading: false }));
  }

  handleReject = (roomId, bookingId, reason) => {
    this.setState({ loading: true });
    this.props.onReject(roomId, bookingId, reason)
      .then(() => this.loadBookings(this.state.currentPage))
      .catch(() => this.setState({ loading: false }));
  }

  render() {
    const { bookings, pagination, currentPage, loading } = this.state;

    return (
      <div className="pending-requests">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h2 className="admin-dashboard__title" style={{ margin: 0 }}>Pending Booking Requests</h2>
          <button 
            onClick={() => this.loadBookings(currentPage)} 
            className="button button--alternative"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh List'}
          </button>
        </div>
        
        {bookings.length === 0 ? (
          <div className="admin-dashboard" style={{ textAlign: 'center', padding: '50px' }}>
            <p style={{ fontSize: '1.8rem', color: '#666' }}>No pending requests at the moment.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Room</th>
                <th>Capacity</th>
                <th>Participants</th>
                <th>User</th>
                <th>Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(item => {
                const isOverCapacity = item.booking.participants > item.roomCapacity;
                return (
                  <tr key={item.booking._id}>
                    <td className="room-info-cell">
                      {item.roomName}
                      <small>Floor {item.roomFloor}</small>
                    </td>
                    <td>{item.roomCapacity}</td>
                    <td>
                      <span className={isOverCapacity ? 'capacity-warning' : ''}>
                        {item.booking.participants}
                        {isOverCapacity && <span title="Participants exceed capacity">⚠️</span>}
                      </span>
                    </td>
                    <td className="room-info-cell">
                      {item.user.firstName} {item.user.lastName}
                      <small>{item.user.email}</small>
                    </td>
                    <td className="time-cell">
                      {moment(item.booking.bookingStart).format('DD MMM YYYY')}
                      <small>{moment(item.booking.bookingStart).format('HH:mm')} - {moment(item.booking.bookingEnd).format('HH:mm')}</small>
                    </td>
                    <td className="action-cell">
                      <button 
                        onClick={() => this.handleApprove(item._id, item.booking._id)} 
                        className="button button--primary"
                        disabled={loading}
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => {
                          const reason = window.prompt('Enter rejection reason:');
                          if (reason !== null) {
                            this.handleReject(item._id, item.booking._id, reason);
                          }
                        }} 
                        className="button button--alternative"
                        disabled={loading}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {pagination.pages > 1 && (
          <div className="admin-dashboard__nav" style={{ border: 'none', marginTop: '20px' }}>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
              <button 
                key={page} 
                className={`admin-dashboard__nav-item ${page === currentPage ? 'active' : ''}`}
                onClick={() => this.loadBookings(page)}
              >
                {page}
              </button>
            ))}
          </div>
        )}

      </div>
    );
  }
}

export default PendingRequests;
