# API Endpoints Documentation - Room Statistics

## Endpoints Mới Cho Thống Kê Phòng

### 1. Get Room Usage Statistics
**Endpoint:** `GET /rooms/stats/:period`

**Parameters:**
- `period` (string): `'month'` hoặc `'week'`

**Example Request:**
```
GET http://localhost:7000/rooms/stats/month
GET http://localhost:7000/rooms/stats/week
```

**Response:**
```json
{
  "period": "month",
  "startDate": "2026-05-01T00:00:00+10:00",
  "endDate": "2026-05-31T23:59:59+10:00",
  "stats": [
    {
      "roomId": "507f1f77bcf86cd799439012",
      "roomName": "Room 1",
      "floor": "8",
      "totalHours": 8.5,
      "bookingCount": 3
    },
    {
      "roomId": "507f1f77bcf86cd799439013",
      "roomName": "Room 2",
      "floor": "8",
      "totalHours": 6.0,
      "bookingCount": 2
    }
  ]
}
```

**Mô tả:** Trả về danh sách tất cả phòng với:
- `totalHours`: Tổng số giờ được đặt
- `bookingCount`: Số lượng booking

---

### 2. Get Top Rooms By Usage
**Endpoint:** `GET /rooms/top/:metric/:limit?`

**Parameters:**
- `metric` (string): `'hours'` (sắp xếp theo tổng giờ) hoặc `'count'` (sắp xếp theo số booking)
- `limit` (number, optional): Số lượng top rooms (default: 10)
- `period` (query param, optional): `'month'` (default) hoặc `'week'`

**Example Requests:**
```
GET http://localhost:7000/rooms/top/hours/5
GET http://localhost:7000/rooms/top/count/10
GET http://localhost:7000/rooms/top/hours/5?period=week
```

**Response:**
```json
{
  "period": "month",
  "metric": "hours",
  "limit": 5,
  "startDate": "2026-05-01T00:00:00+10:00",
  "endDate": "2026-05-31T23:59:59+10:00",
  "topRooms": [
    {
      "roomId": "507f1f77bcf86cd799439012",
      "roomName": "Room 1",
      "floor": "8",
      "totalHours": 10.5,
      "bookingCount": 4
    },
    {
      "roomId": "507f1f77bcf86cd799439013",
      "roomName": "Room 2",
      "floor": "8",
      "totalHours": 8.0,
      "bookingCount": 3
    }
  ]
}
```

**Mô tả:** Trả về danh sách top N phòng được sắp xếp theo metric đã chỉ định

---

## Testing

### 1. Reset & Seed Database
```bash
cd api

# Xóa tất cả dữ liệu cũ
npm run drop

# Tạo lại rooms và sample bookings
npm run seed
```

### 2. Start Backend Server
```bash
npm run dev
```

Backend sẽ chạy tại: `http://localhost:7000`

### 3. Test Endpoints Với curl

**Test Get Stats - Month:**
```bash
curl http://localhost:7000/rooms/stats/month
```

**Test Get Stats - Week:**
```bash
curl http://localhost:7000/rooms/stats/week
```

**Test Top Rooms - By Hours (Top 5):**
```bash
curl http://localhost:7000/rooms/top/hours/5
```

**Test Top Rooms - By Count (Top 10):**
```bash
curl http://localhost:7000/rooms/top/count/10
```

**Test Top Rooms - By Hours This Week:**
```bash
curl "http://localhost:7000/rooms/top/hours/5?period=week"
```

---

## Implementation Details

### Backend Routes (routes/rooms.js)

#### Route 1: GET /rooms/stats/:period
- Lấy tất cả phòng
- Filter bookings trong khoảng thời gian (tháng/tuần hiện tại)
- Tính tổng giờ và số lượng booking cho mỗi phòng
- Sắp xếp theo totalHours (giảm dần)

#### Route 2: GET /rooms/top/:metric/:limit?
- Tương tự Route 1 nhưng chỉ trả về top N phòng
- Sắp xếp theo metric: `hours` (totalHours) hoặc `count` (bookingCount)
- Hỗ trợ query param `period` để chọn tháng hoặc tuần

### Timezone
- Tất cả booking times được xử lý với timezone **Australia/Sydney**
- Đảm bảo tính toán chính xác khi filter theo tuần/tháng

### Sample Data (seed.js)
- Tạo sample bookings cho 5 rooms đầu tiên
- Mỗi room có 3-5 bookings trong tháng hiện tại
- Dữ liệu này dùng để test các statistics endpoints

---

## Ghi Chú
- Không cần authentication để access các endpoints stats
- Dữ liệu được filter theo timezone Australia/Sydney
- Format date trả về là ISO 8601
