import React from 'react'
import Button from './Button'
import moment from 'moment'
import { formatTime, startTimeSelectOptions, endTimeSelectOptions } from '../helpers/bookingForm'

function FilterElement({
  onSetFloorParam,
  onToggleFeature,
  onToggleCapacity,
  onSetStatusParam,
  floorParam,
  filterParams,
  capacityParams,
  statusParam,
  date
}) {

  return (
    <div className="sidebar__box--filter filter">
      <h3 className="header__heading header__heading--sidebar">Filter</h3>
      <form className="form form--filter">
        <h4 className="form__heading form__heading--filter">Level</h4>
        <div className="form__group" onChange={(event) => onSetFloorParam(event.target.value)}>
          <div className="form__group">
            <input type="radio" value="all" id="all" name="floor-select" className="form__input--radio" checked={floorParam === 'all'} readOnly />
            <label htmlFor="all" className="form__label form__label--inline">All Levels</label>
          </div>
          <div className="form__group">
            <input type="radio" value="8" id="8" name="floor-select" className="form__input--radio" checked={floorParam === '8'} readOnly />
            <label htmlFor="8" className="form__label form__label--inline">Level 8</label>
          </div>
          <div className="form__group">
            <input type="radio" value="13" id="13" name="floor-select" className="form__input--radio" checked={floorParam === '13'} readOnly />
            <label htmlFor="13" className="form__label form__label--inline">Level 13</label>
          </div>
        </div>

        <h4 className="form__heading form__heading--filter">Features</h4>
        <div onChange={(event) => onToggleFeature(event.target.name)} >
          <div className="form__group">
            <input type="checkbox" id="macLab" name="macLab" className="form__input--checkbox" checked={filterParams[0].value} readOnly />
            <label htmlFor="macLab" className="form__label form__label--inline">Mac Lab</label>
          </div>
          <div className="form_group">
            <input type="checkbox" id="pcLab" name="pcLab" className="form__input--checkbox" checked={filterParams[1].value} readOnly />
            <label htmlFor="pcLab" className="form__label form__label--inline">PC Lab</label>
          </div>
          <div className="form_group">
            <input type="checkbox" id="tv" name="tv" className="form__input--checkbox" checked={filterParams[2].value} readOnly />
            <label htmlFor="tv" className="form__label form__label--inline">TV</label>
          </div>
          <div className="form_group">
            <input type="checkbox" id="opWalls" name="opWalls" className="form__input--checkbox" checked={filterParams[3].value} readOnly />
            <label htmlFor="opWalls" className="form__label form__label--inline">Operable Walls</label>
          </div>
          <div className="form_group">
            <input type="checkbox" id="projector" name="projector" className="form__input--checkbox" checked={filterParams[4].value} readOnly />
            <label htmlFor="projector" className="form__label form__label--inline">Projector</label>
          </div>
        </div>
        <h4 className="form__heading form__heading--filter">Capacity</h4>
        <div onChange={ (event) => onToggleCapacity(event.target.id)}>
          <div className="form_group">
            <input type="checkbox" id="16seats" name="16seats" className="form__input--checkbox" checked={capacityParams[0].value} readOnly />
            <label htmlFor="16seats" className="form__label form__label--inline">16 Seats</label>
          </div>
          <div className="form_group">
            <input type="checkbox" id="18seats" name="18seats" className="form__input--checkbox" checked={capacityParams[1].value} readOnly />
            <label htmlFor="18seats" className="form__label form__label--inline">18 Seats</label>
          </div>
          <div className="form_group">
            <input type="checkbox" id="20seats" name="20seats" className="form__input--checkbox" checked={capacityParams[2].value} readOnly />
            <label htmlFor="20seats" className="form__label form__label--inline">20 Seats</label>
          </div>
          <div className="form_group">
            <input type="checkbox" id="24seats" name="24seats" className="form__input--checkbox" checked={capacityParams[3].value} readOnly />
            <label htmlFor="24seats" className="form__label form__label--inline">24 Seats</label>
          </div>
          <div className="form_group">
            <input type="checkbox" id="40seats" name="40seats" className="form__input--checkbox" checked={capacityParams[4].value} readOnly />
            <label htmlFor="40seats" className="form__label form__label--inline">40 Seats</label>
          </div>
        </div>
        <h4 className="form__heading form__heading--filter">Status</h4>
          <div onChange={(event) => onSetStatusParam(event.target.value)} >
            <div className="form_group">
              <input type="radio" id="statusPending" value="pending" name="status" className="form__input--radio" checked={statusParam === 'pending'} readOnly />
              <label htmlFor="statusPending" className="form__label form__label--inline">Has Pending</label>
            </div>
            <div className="form_group">
              <input type="radio" id="statusAccepted" value="accepted" name="status" className="form__input--radio" checked={statusParam === 'accepted'} readOnly />
              <label htmlFor="statusAccepted" className="form__label form__label--inline">Has Accepted</label>
            </div>
            <div className="form_group">
              <input type="radio" id="statusMaintenance" value="maintenance" name="status" className="form__input--radio" checked={statusParam === 'maintenance'} readOnly />
              <label htmlFor="statusMaintenance" className="form__label form__label--inline">Has Maintenance</label>
            </div>
            <div className="form_group">
              <input type="radio" id="statusAll" value="all" name="status" className="form__input--radio" checked={!statusParam || statusParam === 'all'} readOnly />
              <label htmlFor="statusAll" className="form__label form__label--inline">All Rooms</label>
            </div>
          </div>
      </form>
    </div>
  )
}

export default FilterElement