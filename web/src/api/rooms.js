import React from 'react'
import moment from 'moment'
import api from './init'

export function listRooms() {
  return api.get('/rooms').then(res => res.data)
}

export function getRoomStats(period) {
  return api.get(`/rooms/stats/${period}`).then(res => res.data)
}

export function getTopRooms(metric, limit = 10, period = 'month') {
  return api.get(`/rooms/top/${metric}/${limit}?period=${period}`).then(res => res.data)
}
