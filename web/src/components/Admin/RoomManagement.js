import React, { Component, Fragment } from 'react';

class RoomManagement extends Component {
  state = {
    editingRoom: null,
    editName: '',
    editCapacity: '',
    editFloor: '',
    showAddForm: false,
    newName: '',
    newFloor: '8',
    newCapacity: ''
  };

  startEdit = (room) => {
    this.setState({
      editingRoom: room._id,
      editName: room.name,
      editCapacity: room.capacity,
      editFloor: room.floor
    });
  }

  handleUpdate = () => {
    const { editingRoom, editName, editCapacity, editFloor } = this.state;
    this.props.onUpdateRoom(editingRoom, {
      name: editName,
      capacity: parseInt(editCapacity),
      floor: editFloor
    });
    this.setState({ editingRoom: null });
  }

  handleAddRoom = (e) => {
    e.preventDefault();
    const { newName, newFloor, newCapacity } = this.state;
    this.props.onCreateRoom({
      name: newName,
      floor: newFloor,
      capacity: parseInt(newCapacity)
    });
    this.setState({
      showAddForm: false,
      newName: '',
      newFloor: '8',
      newCapacity: ''
    });
  }

  render() {
    const { rooms, onDeleteRoom } = this.props;
    const { editingRoom, editName, editCapacity, showAddForm, newName, newFloor, newCapacity } = this.state;

    return (
      <div className="room-management">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h2 className="admin-dashboard__title" style={{ margin: 0 }}>Room Inventory</h2>
          <button 
            onClick={() => this.setState({ showAddForm: !showAddForm })} 
            className="button button--primary"
          >
            {showAddForm ? 'Cancel' : '+ Add New Room'}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={this.handleAddRoom} className="admin-form">
            <h3 className="admin-form__title">Create New Room</h3>
            <div className="admin-form__grid">
              <div className="admin-form__field">
                <label className="form__label">Room Name</label>
                <input 
                  type="text" 
                  value={newName} 
                  onChange={(e) => this.setState({ newName: e.target.value })}
                  className="form__input" 
                  required
                  placeholder="e.g. Room 1"
                />
              </div>
              <div className="admin-form__field">
                <label className="form__label">Floor</label>
                <select 
                  value={newFloor} 
                  onChange={(e) => this.setState({ newFloor: e.target.value })}
                  className="form__input"
                >
                  <option value="8">Floor 8</option>
                  <option value="13">Floor 13</option>
                </select>
              </div>
              <div className="admin-form__field">
                <label className="form__label">Capacity</label>
                <input 
                  type="number" 
                  value={newCapacity} 
                  onChange={(e) => this.setState({ newCapacity: e.target.value })}
                  className="form__input" 
                  required
                  placeholder="e.g. 10"
                />
              </div>
            </div>
            <button type="submit" className="button button--primary">Create Room</button>
          </form>
        )}
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Floor</th>
              <th>Capacity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms && rooms.map(room => (
              <tr key={room._id} style={room.isDeleted ? { opacity: 0.6, background: '#f9f9f9' } : {}}>
                <td>
                  {editingRoom === room._id ? (
                    <input 
                      type="text" 
                      value={editName} 
                      onChange={(e) => this.setState({ editName: e.target.value })} 
                      className="form__input"
                    />
                  ) : (
                    <span>
                      {room.name} {room.isDeleted && <span className="status-badge status-badge--rejected" style={{ fontSize: '0.8rem', padding: '2px 8px', marginLeft: '10px' }}>Hidden</span>}
                    </span>
                  )}
                </td>
                <td>
                  {editingRoom === room._id ? (
                    <select 
                      value={this.state.editFloor} 
                      onChange={(e) => this.setState({ editFloor: e.target.value })}
                      className="form__input"
                    >
                      <option value="8">8</option>
                      <option value="13">13</option>
                    </select>
                  ) : room.floor}
                </td>
                <td>
                  {editingRoom === room._id ? (
                    <input 
                      type="number" 
                      value={editCapacity} 
                      onChange={(e) => this.setState({ editCapacity: e.target.value })} 
                      className="form__input"
                    />
                  ) : room.capacity}
                </td>
                <td>
                  {editingRoom === room._id ? (
                    <div className="admin-table__actions">
                      <button onClick={this.handleUpdate} className="button button--primary">Save</button>
                      
                      <button 
                        onClick={() => this.props.onUpdateRoom(room._id, { isMaintenance: !room.isMaintenance })} 
                        className={`button button--maintenance ${room.isMaintenance ? 'active' : ''}`}
                      >
                        {room.isMaintenance ? '🛠 Maintenance: ON' : 'Set Maintenance'}
                      </button>

                      {room.isDeleted ? (
                        <button onClick={() => this.props.onUpdateRoom(room._id, { isDeleted: false })} className="button button--primary" style={{ background: '#27ae60', border: 'none' }}>Restore</button>
                      ) : (
                        <button onClick={() => {
                          if (window.confirm('Are you sure you want to hide this room?')) {
                            onDeleteRoom(room._id);
                            this.setState({ editingRoom: null });
                          }
                        }} className="button button--alternative">Hide Room</button>
                      )}

                      <button onClick={() => this.setState({ editingRoom: null })} className="button button--alternative">Cancel</button>
                    </div>
                  ) : (
                    <Fragment>
                      <button onClick={() => this.startEdit(room)} className="button button--primary">Edit</button>
                      {room.isMaintenance && (
                         <span className="status-badge status-badge--rejected" style={{ marginLeft: '10px' }}>🛠 Maintenance</span>
                      )}
                    </Fragment>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export default RoomManagement;
