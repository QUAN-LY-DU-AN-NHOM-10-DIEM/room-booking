import React from 'react'

const Key = props => (
  <div className="sidebar__box--key key">
    <h3 className="header__heading header__heading--sidebar">Note</h3>
    <div className="key__group">
      <span className="key__square key__square--pending"></span>
      <p className="key__description">Pending</p>
    </div>
    <div className="key__group">
      <span className="key__square key__square--accepted"></span>
      <p className="key__description">Accepted</p>
    </div>
    <div className="key__group">
      <span className="key__square key__square--maintenance"></span>
      <p className="key__description">Maintenance</p>
    </div>
  </div>
)

export default Key