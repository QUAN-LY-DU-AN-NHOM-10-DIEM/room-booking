// RoomStats.js
import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Calendar, TrendingUp, Clock, Award, Trophy, Zap, Target, Crown, Medal, Sparkles } from 'lucide-react';

// Import API từ file init.js hoặc file helper của bạn
import { getRoomStats } from '../api/rooms'; 
import '../css/RoomStats.css'; 

export default function RoomStats({ isAdmin = false }) {
  // Check if user is admin
  if (!isAdmin) {
    return (
      <div className="rs-dashboard" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2 style={{ color: '#ed1c24', marginBottom: '1rem', fontSize: '1.5rem', textTransform: 'uppercase' }}>Access Denied</h2>
          <p style={{ fontSize: '1rem', color: '#666' }}>Chỉ quản trị viên mới có thể xem thống kê phòng</p>
          <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>(Only administrators can view room statistics)</p>
        </div>
      </div>
    );
  }

  const [viewMode, setViewMode] = useState('month');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState('totalHours');

  useEffect(() => {
    setLoading(true);
    getRoomStats(viewMode)
      .then(response => {
        setData(response.stats || []); 
        setLoading(false);
      })
      .catch(error => {
        console.error("Lỗi khi tải dữ liệu thống kê phòng:", error);
        setLoading(false);
      });
  }, [viewMode]);
  
  const totalHoursAll = data.reduce((sum, item) => sum + item.totalHours, 0);
  const avgHours = data.length > 0 ? (totalHoursAll / data.length).toFixed(1) : 0;
  
  const mostBookedRoom = data.length > 0 
    ? data.reduce((prev, current) => (prev.bookingCount > current.bookingCount) ? prev : current).roomName
    : 'N/A';

  const totalBookingsAll = data.reduce((sum, item) => sum + item.bookingCount, 0);

  const getEfficiencyScore = (totalHours, bookingCount) => {
    return bookingCount > 0 ? (totalHours / bookingCount).toFixed(1) : 0;
  };

  const getSortedRooms = () => {
    const rooms = [...data];
    switch(selectedMetric) {
      case 'totalHours': 
        return rooms.sort((a, b) => b.totalHours - a.totalHours);
      case 'bookingCount': 
        return rooms.sort((a, b) => b.bookingCount - a.bookingCount);
      case 'efficiency': 
        return rooms.sort((a, b) => getEfficiencyScore(b.totalHours, b.bookingCount) - getEfficiencyScore(a.totalHours, a.bookingCount));
      default: 
        return rooms;
    }
  };

  const topRooms = getSortedRooms().slice(0, 5);

  const getRankClass = (index) => {
    switch(index) {
      case 0: return 'rank-1';
      case 1: return 'rank-2';
      case 2: return 'rank-3';
      default: return 'rank-other';
    }
  };

  const getRankIcon = (index) => {
    switch(index) {
      case 0: return <Crown size={24} color="#ed1c24" />;
      case 1: return <Medal size={24} color="#1c1c1c" />;
      case 2: return <Medal size={24} color="#1c1c1c" />;
      default: return index + 1;
    }
  };

  if (loading) {
    return (
      <div className="rs-dashboard" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: '1.25rem', color: '#666' }}>Đang tải dữ liệu thống kê...</p>
      </div>
    );
  }

  return (
    <div className="rs-dashboard">
      <div className="rs-container">

        {/* Stats Cards */}
        <div className="rs-stats-grid">
          <div className="rs-stat-card">
            <div className="rs-stat-icon-wrapper" style={{ color: '#1c1c1c' }}>
              <Clock size={28} />
            </div>
            <p className="label" style={{ color: '#666', fontSize: '1.2rem', fontWeight: 700, textTransform: 'uppercase' }}>Total Hours</p>
            <p className="rs-stat-value">{totalHoursAll}</p>
          </div>

          <div className="rs-stat-card">
            <div className="rs-stat-icon-wrapper" style={{ color: '#1c1c1c' }}>
              <TrendingUp size={28} />
            </div>
            <p className="label" style={{ color: '#666', fontSize: '1.2rem', fontWeight: 700, textTransform: 'uppercase' }}>Avg Hours/Room</p>
            <p className="rs-stat-value">{avgHours}</p>
          </div>

          <div className="rs-stat-card">
            <div className="rs-stat-icon-wrapper" style={{ color: '#1c1c1c' }}>
              <Award size={28} />
            </div>
            <p className="label" style={{ color: '#666', fontSize: '1.2rem', fontWeight: 700, textTransform: 'uppercase' }}>Most Booked</p>
            <p className="rs-stat-value" style={{ fontSize: '1.6rem', marginTop: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {mostBookedRoom}
            </p>
          </div>

          <div className="rs-stat-card">
            <div className="rs-stat-icon-wrapper" style={{ color: '#1c1c1c' }}>
              <Target size={28} />
            </div>
            <p className="label" style={{ color: '#666', fontSize: '1.2rem', fontWeight: 700, textTransform: 'uppercase' }}>Total Bookings</p>
            <p className="rs-stat-value">{totalBookingsAll}</p>
          </div>
        </div>

        {/* Chart Section */}
        <div className="rs-section-box">
          <div className="rs-controls">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: '#eee', border: '0.1rem solid #cecece' }}>
                <Calendar size={24} color="#1c1c1c" />
              </div>
              <h2 style={{ margin: 0, fontSize: '2.2rem', fontWeight: 700, color: '#1c1c1c', textTransform: 'uppercase' }}>Usage Statistics</h2>
            </div>
            <div className="rs-tabs">
              <button 
                className={viewMode === 'week' ? 'active' : ''}
                onClick={() => setViewMode('week')}
              >
                Weekly
              </button>
              <button 
                className={viewMode === 'month' ? 'active' : ''}
                onClick={() => setViewMode('month')}
              >
                Monthly
              </button>
            </div>
          </div>

          <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
              <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cecece" vertical={false} />
                <XAxis 
                  dataKey="roomName" 
                  tick={{ fontSize: 13, fill: '#666', fontWeight: 600, fontFamily: 'Raleway' }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis 
                  tick={{ fontSize: 13, fill: '#666', fontWeight: 600, fontFamily: 'Raleway' }}
                  axisLine={false}
                  tickLine={false}
                  dx={-10}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(237, 28, 36, 0.02)' }}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '0.1rem solid #1c1c1c',
                    borderRadius: '0',
                    boxShadow: '0px 2px 5px 0px #cecece',
                    color: '#1c1c1c',
                    fontFamily: 'Raleway'
                  }}
                  itemStyle={{ color: '#ed1c24', fontWeight: 700 }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px', fontFamily: 'Raleway', fontWeight: 600 }} />
                <Bar 
                  dataKey="totalHours" 
                  fill="#1c1c1c" 
                  name="Usage Hours"
                  radius={[0, 0, 0, 0]}
                  maxBarSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performing Rooms Section */}
        <div className="rs-ranking-table">
          <div className="rs-ranking-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: '#eee', border: '0.1rem solid #cecece' }}>
                <Trophy size={24} color="#1c1c1c" />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 700, color: '#1c1c1c', textTransform: 'uppercase' }}>Top Performing Rooms</h2>
                <p style={{ margin: 0, fontSize: '1.4rem', color: '#666', fontWeight: 500 }}>Ranked by performance metrics</p>
              </div>
            </div>
            
            <div className="rs-metric-filters">
              <button 
                className={selectedMetric === 'totalHours' ? 'active' : ''}
                onClick={() => setSelectedMetric('totalHours')}
              >
                Most Hours
              </button>
              <button 
                className={selectedMetric === 'bookingCount' ? 'active' : ''}
                onClick={() => setSelectedMetric('bookingCount')}
              >
                Most Booked
              </button>
              <button 
                className={selectedMetric === 'efficiency' ? 'active' : ''}
                onClick={() => setSelectedMetric('efficiency')}
              >
                Efficiency
              </button>
            </div>
          </div>

          <div className="rs-ranking-list">
            {topRooms.length > 0 ? topRooms.map((room, index) => {
              const utilizationRate = totalHoursAll > 0 ? Math.round((room.totalHours / totalHoursAll) * 100) : 0;
              const efficiencyScore = getEfficiencyScore(room.totalHours, room.bookingCount);
              
              return (
                <div key={room.roomId} className="rs-room-row">
                  <div className={`rs-rank-badge ${getRankClass(index)}`}>
                    {getRankIcon(index)}
                  </div>
                  
                  <div className="rs-room-info">
                    <h3>{room.roomName}</h3>
                    <p>Floor {room.floor}</p>
                  </div>

                  <div className="rs-room-stats" style={{ gap: '4rem' }}>
                    <div className="rs-stat-item">
                      <div className="label">Hours</div>
                      <div className="value">{room.totalHours}</div>
                    </div>
                    <div className="rs-stat-item">
                      <div className="label">Bookings</div>
                      <div className="value">{room.bookingCount}</div>
                    </div>
                    <div className="rs-stat-item">
                      <div className="label">Efficiency</div>
                      <div className="value" style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                        <Zap size={18} color="#ed1c24" /> {efficiencyScore}
                      </div>
                    </div>
                  </div>

                  <div className="rs-progress-container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '1.2rem', color: '#666', fontWeight: 700 }}>
                      <span>UTILIZATION</span>
                      <span>{utilizationRate}%</span>
                    </div>
                    <div className="rs-progress-bar">
                      <div 
                        className="rs-progress-fill" 
                        style={{ width: `${utilizationRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#666', fontSize: '1.6rem' }}>
                Không có dữ liệu phòng trong giai đoạn này.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}