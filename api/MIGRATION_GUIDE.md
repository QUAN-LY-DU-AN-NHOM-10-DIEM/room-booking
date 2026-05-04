# Hướng dẫn chạy Migration cho hệ thống Auth mới

Hệ thống vừa được cập nhật thêm các tính năng:
1. **Refresh Token**: Tự động duy trì đăng nhập.
2. **Admin Whitelist**: Phân quyền Admin dựa trên Email Google.

Để hệ thống hoạt động chính xác, bạn cần chạy các bản cập nhật database sau:

## 1. Chạy cập nhật (Up Migration)
Mở terminal tại thư mục `api` và chạy lệnh:

```powershell
npm run migrate:auth:up
```

Lệnh này sẽ:
- Tạo các index cần thiết cho bảng `AdminWhitelist` và `RefreshToken`.
- Cấu hình TTL index (tự động xóa token hết hạn).
- Thêm các email mặc định vào danh sách trắng Admin (`admin@hcmut.edu.vn`, `nhom10diem@hcmut.edu.vn`).

## 2. Hoàn tác cập nhật (Down Migration)
Nếu bạn muốn xóa bỏ các thay đổi này, chạy lệnh:

```powershell
npm run migrate:auth:down
```

---

## Lưu ý:
- Đảm bảo đã chạy `npm run migrate:up` (migration 001) trước khi chạy bản auth này.
- Hệ thống Frontend (Web) sẽ tự động nhận diện và sử dụng cơ chế mới sau khi bạn F5 lại trang.
- Để thêm Admin mới, bạn có thể thêm trực tiếp vào bảng `adminwhitelists` trong MongoDB.
