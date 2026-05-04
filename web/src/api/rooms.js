import React from 'react'
import moment from 'moment'
import api from './init'

export function listRooms(all = false) {
  return api.get(`/rooms${all ? '?all=true' : ''}`).then(res => res.data)
}

export function updateRoom(id, roomData) {
  return api.patch(`/rooms/${id}`, roomData).then(res => res.data)
}

export function deleteRoom(id) {
  return api.delete(`/rooms/${id}`).then(res => res.data)
}

export function createRoom(roomData) {
  return api.post('/rooms', roomData).then(res => res.data)
}
