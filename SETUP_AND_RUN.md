# Hướng Dẫn Chạy Dự Án

## Yêu Cầu Trước Tiên

### Cài Đặt Các Công Cụ Cần Thiết
- **Node.js** - [Tải từ nodejs.org](https://nodejs.org/)
- **MongoDB** - [Tải từ mongodb.com](https://www.mongodb.com/try/download/community)
- **Yarn** hoặc **npm** (đi kèm với Node.js)
- **Git** - [Tải từ git-scm.com](https://git-scm.com/)

## Bước 1: Clone Dự Án

```bash
git clone https://github.com/julia-/room-booking-system
cd room-booking
```

## Bước 2: Cài Đặt Backend (API)

```bash
cd api
yarn install
```

hoặc

```bash
npm install
```

## Bước 3: Cài Đặt Frontend (Web)

Mở terminal mới và chạy:

```bash
cd web
yarn install
```

hoặc

```bash
npm install
```

## Bước 4: Khởi Động MongoDB

Đảm bảo MongoDB đang chạy trên hệ thống của bạn. Bạn có thể kiểm tra bằng cách:

```bash
mongo
```

## Bước 5: Seed Dữ Liệu (Optional)

Trong folder `api`, chạy:

```bash
yarn seed
```

hoặc

```bash
npm run seed
```

## Bước 6: Chạy Backend

Trong folder `api`, chạy:

```bash
yarn dev
```

hoặc

```bash
npm run dev
```

Backend sẽ chạy tại: **http://localhost:7000**

## Bước 7: Chạy Frontend

Mở terminal mới, chuyển vào folder `web`, rồi chạy:

```bash
yarn start
```

hoặc

```bash
npm start
```

Frontend sẽ chạy tại: **http://localhost:3000**

## Bước 8: Mở Ứng Dụng

Mở trình duyệt web và truy cập:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:7000

---

## Cấu Hình Google OAuth (Tùy Chọn)

Nếu muốn sử dụng đăng nhập Google, hãy:

1. Đăng ký ứng dụng tại [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo OAuth 2.0 Client ID
3. Thêm credentials vào file cấu hình của backend

Xem thêm: [Passport Google OAuth2](https://github.com/jaredhanson/passport-google-oauth2)

---

## Xử Lý Sự Cố

### Backend không chạy được
- Kiểm tra MongoDB có chạy không
- Kiểm tra cổng 7000 có bị chiếm không

### Frontend không chạy được
- Xóa folder `node_modules` và chạy `yarn install` lại
- Kiểm tra cổng 3000 có bị chiếm không

### Lỗi về dependencies
```bash
yarn cache clean
yarn install
```

---

**Chúc mừng! Dự án của bạn đã sẵn sàng để phát triển!** 🚀
