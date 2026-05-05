import React, { Component } from 'react';
import RoomManagement from './RoomManagement';
import PendingRequests from './PendingRequests';
import RoomStats from '../RoomStats';
import '../../css/AdminDashboard.css';

class AdminDashboard extends Component {
  state = {
    activeTab: 'rooms', // 'rooms', 'pending', or 'stats'
    showHidden: false
  };

  handleToggleHidden = () => {
    const { showHidden } = this.state;
    this.setState({ showHidden: !showHidden });
  }

  render() {
    const { activeTab, showHidden } = this.state;
    const { roomData, onUpdateRoom, onCreateRoom, onDeleteRoom, onApprove, onReject } = this.props;

    // Filter rooms based on hidden status if not in "showHidden" mode
    // (Note: The API also filters, but this is a secondary safety or for future flexibility)
    const displayRooms = showHidden ? roomData : roomData.filter(r => !r.isDeleted);

    return (
      <div className="admin-dashboard">
        <header className="admin-dashboard__header">
          <h1 className="admin-dashboard__title">Admin Control Panel</h1>
          <p className="admin-dashboard__subtitle">Manage rooms and booking requests with ease</p>
        </header>

        <nav className="admin-dashboard__nav">
          <button 
            className={`admin-dashboard__nav-item ${activeTab === 'rooms' ? 'active' : ''}`}
            onClick={() => this.setState({ activeTab: 'rooms' })}
          >
            Room Inventory
          </button>
          <button 
            className={`admin-dashboard__nav-item ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => this.setState({ activeTab: 'pending' })}
          >
            Booking Requests
          </button>
          <button 
            className={`admin-dashboard__nav-item ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => this.setState({ activeTab: 'stats' })}
          >
            Room Statistics
          </button>
        </nav>

        {activeTab === 'rooms' && (
          <div style={{ textAlign: 'right', marginBottom: '20px' }}>
            <label style={{ fontSize: '1.6rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
              <input 
                type="checkbox" 
                checked={showHidden} 
                onChange={this.handleToggleHidden}
                style={{ width: '20px', height: '20px' }}
              />
              Show Hidden Rooms
            </label>
          </div>
        )}

        <main className="admin-dashboard__content">
          {activeTab === 'rooms' ? (
            <div className="admin-dashboard__tab-content">
              <RoomManagement 
                rooms={displayRooms} 
                onUpdateRoom={onUpdateRoom}
                onCreateRoom={onCreateRoom}
                onDeleteRoom={onDeleteRoom}
              />
            </div>
          ) : (
            <div className="admin-dashboard__tab-content">
              <PendingRequests 
                onApprove={onApprove}
                onReject={onReject}
              />
            </div>
          )}
          {activeTab === 'stats' && (
            <div className="admin-dashboard__tab-content">
              <RoomStats isAdmin={true} />
            </div>
          )}
        </main>
      </div>
    );
  }
}

export default AdminDashboard;
