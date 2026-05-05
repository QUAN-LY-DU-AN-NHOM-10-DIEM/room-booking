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

// Import API từ file init.js hoặc file helper của bạn[cite: 14]
import { getRoomStats } from '../api/rooms'; // Đổi lại đường dẫn cho khớp với cấu trúc thư mục của bạn
import '../css/RoomStats.css'; 

export default function RoomStats({ isAdmin = false }) {
  // Check if user is admin
  if (!isAdmin) {
    return (
      <div className="rs-dashboard" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2 style={{ color: '#DC2626', marginBottom: '1rem', fontSize: '1.5rem' }}>Access Denied</h2>
          <p style={{ fontSize: '1rem', color: '#6B7280' }}>Chỉ quản trị viên mới có thể xem thống kê phòng</p>
          <p style={{ fontSize: '0.875rem', color: '#9CA3AF', marginTop: '0.5rem' }}>(Only administrators can view room statistics)</p>
        </div>
      </div>
    );
  }

  const [viewMode, setViewMode] = useState('month'); // BE nhận 'month' hoặc 'week'
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState('totalHours');

  // Fetch dữ liệu từ BE mỗi khi đổi ViewMode (Weekly/Monthly)
  useEffect(() => {
    setLoading(true);
    getRoomStats(viewMode)
      .then(response => {
        // response.stats chứa mảng các phòng với: roomId, roomName, floor, totalHours, bookingCount
        setData(response.stats || []); 
        setLoading(false);
      })
      .catch(error => {
        console.error("Lỗi khi tải dữ liệu thống kê phòng:", error);
        setLoading(false);
      });
  }, [viewMode]);
  
  // Tính toán các chỉ số tổng quan cho Stats Cards
  const totalHoursAll = data.reduce((sum, item) => sum + item.totalHours, 0);
  const avgHours = data.length > 0 ? (totalHoursAll / data.length).toFixed(1) : 0;
  
  const mostBookedRoom = data.length > 0 
    ? data.reduce((prev, current) => (prev.bookingCount > current.bookingCount) ? prev : current).roomName
    : 'N/A';

  const totalBookingsAll = data.reduce((sum, item) => sum + item.bookingCount, 0);

  // Tính điểm hiệu suất (giờ/lượt đặt)
  const getEfficiencyScore = (totalHours, bookingCount) => {
    return bookingCount > 0 ? (totalHours / bookingCount).toFixed(1) : 0;
  };

  // Sắp xếp dữ liệu cho danh sách Top Rooms dựa trên metric được chọn
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

  // Lấy Top 5 phòng
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
      case 0: return <Crown size={24} color="#FFFFFF" />;
      case 1: return <Medal size={24} color="#FFFFFF" />;
      case 2: return <Medal size={24} color="#FFFFFF" />;
      default: return index + 1;
    }
  };

  if (loading) {
    return (
      <div className="rs-dashboard" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: '1.25rem', color: '#6B7280' }}>Đang tải dữ liệu thống kê...</p>
      </div>
    );
  }

  return (
    <div className="rs-dashboard">
      <div className="rs-container">
        
        

        {/* Stats Cards */}
        <div className="rs-stats-grid">
          <div className="rs-stat-card">
            <div className="rs-stat-icon-wrapper" style={{ color: '#0284C7', background: '#E0F2FE' }}>
              <Clock size={28} />
            </div>
            <p className="label" style={{ color: '#6B7280', fontSize: '0.875rem', fontWeight: 600 }}>Total Hours</p>
            <p className="rs-stat-value">{totalHoursAll}</p>
          </div>

          <div className="rs-stat-card">
            <div className="rs-stat-icon-wrapper" style={{ color: '#059669', background: '#D1FAE5' }}>
              <TrendingUp size={28} />
            </div>
            <p className="label" style={{ color: '#6B7280', fontSize: '0.875rem', fontWeight: 600 }}>Avg Hours/Room</p>
            <p className="rs-stat-value">{avgHours}</p>
          </div>

          <div className="rs-stat-card">
            <div className="rs-stat-icon-wrapper" style={{ color: '#7C3AED', background: '#EDE9FE' }}>
              <Award size={28} />
            </div>
            <p className="label" style={{ color: '#6B7280', fontSize: '0.875rem', fontWeight: 600 }}>Most Booked Room</p>
            <p className="rs-stat-value" style={{ fontSize: '1.25rem', marginTop: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {mostBookedRoom}
            </p>
          </div>

          <div className="rs-stat-card">
            <div className="rs-stat-icon-wrapper" style={{ color: '#EA580C', background: '#FFEDD5' }}>
              <Target size={28} />
            </div>
            <p className="label" style={{ color: '#6B7280', fontSize: '0.875rem', fontWeight: 600 }}>Total Bookings</p>
            <p className="rs-stat-value">{totalBookingsAll}</p>
          </div>
        </div>

        {/* Chart Section */}
        <div className="rs-section-box">
          <div className="rs-controls">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ padding: '0.5rem', background: '#F3F4F6', borderRadius: '8px' }}>
                <Calendar size={24} color="#4B5563" />
              </div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1F2937' }}>Usage Statistics</h2>
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
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis 
                  dataKey="roomName" 
                  tick={{ fontSize: 13, fill: '#6B7280', fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis 
                  tick={{ fontSize: 13, fill: '#6B7280', fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  dx={-10}
                />
                <Tooltip
                  cursor={{ fill: '#F3F4F6' }}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    color: '#1F2937'
                  }}
                  itemStyle={{ color: '#0284C7', fontWeight: 600 }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar 
                  dataKey="totalHours" 
                  fill="#0284C7" 
                  name="Usage Hours"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performing Rooms Section */}
        <div className="rs-ranking-table">
          <div className="rs-ranking-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ padding: '0.5rem', background: '#FEF3C7', borderRadius: '8px' }}>
                <Trophy size={24} color="#D97706" />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1F2937' }}>Top Performing Rooms</h2>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#6B7280' }}>Ranked by performance metrics</p>
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
                    <p>📍 Floor {room.floor}</p>
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
                        <Zap size={18} color="#F59E0B" /> {efficiencyScore}
                      </div>
                    </div>
                  </div>

                  <div className="rs-progress-container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.75rem', color: '#6B7280', fontWeight: 600 }}>
                      <span>Utilization</span>
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
              <div style={{ padding: '3rem', textAlign: 'center', color: '#6B7280' }}>
                Không có dữ liệu phòng trong giai đoạn này.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}