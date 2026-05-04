# Kế hoạch chi tiết: Google Login cho Staff (API)

## 1) Mục tiêu
- Triển khai đăng nhập Google cho người dùng Staff trên API.
- Chỉ cho phép email thuộc domain `@hcmut.edu.vn`.
- Đồng bộ hồ sơ user vào database.
- Trả về JWT nội bộ để client duy trì phiên đăng nhập.

## 2) Phạm vi và giả định
- Phạm vi: Backend API (Express + Passport + JWT + Mongoose).
- Không thay đổi flow đặt phòng hiện tại.
- Không bỏ local login ngay lập tức; cho phép song song trong giai đoạn chuyển đổi.

## 3) Hiện trạng codebase (đã xác minh)
- Auth route hiện có:
  - `POST /auth/sign-up`
  - `POST /auth`
- Middleware auth hiện có:
  - Local strategy (passport-local-mongoose)
  - JWT strategy (passport-jwt)
  - Hàm ký JWT nội bộ
- User model hiện có:
  - `firstName`, `lastName`, `email`
- Dependency đã có sẵn:
  - `passport-google-oauth20`

## 4) Backlog chi tiết theo task

### Task 1.1: Thiết kế schema bảng Users

#### Yêu cầu
Định nghĩa cấu trúc `users` gồm các trường:
- `id` (UUID)
- `email` (Unique)
- `full_name`
- `avatar_url`
- `role` (mặc định `Staff`)
- `created_at`

#### Thiết kế đề xuất (logic level)
- `id`: UUID v4, primary key/unique key.
- `email`: string, lowercase, unique, bắt buộc.
- `full_name`: string, bắt buộc.
- `avatar_url`: string, nullable.
- `role`: enum (`Staff`, `Admin`, `User`), default `Staff`.
- `created_at`: timestamp, default now().
- (bổ sung để vận hành): `updated_at`, `provider`, `google_sub`, `last_login_at`.

#### Mapping cho codebase hiện tại (MongoDB)
- Mongoose vẫn có `_id` mặc định, có 2 cách:
  1. Dùng `_id` của Mongo cho nội bộ, thêm trường `id` lưu UUID để trả ra API.
  2. Hoặc đổi `_id` sang String UUID (rủi ro cao hơn với code cũ).
- Khuyến nghị: cách 1 (an toàn, dễ rollout).

#### Điều kiện chấp nhận (Acceptance Criteria)
- User mới được tạo có đủ các field theo yêu cầu.
- `email` unique và lowercase.
- `role` default là `Staff` nếu không cung cấp.
- `created_at` tự động sinh.

---

### Task 1.2: Cấu hình Migration

#### Mục tiêu
Viết migration script khởi tạo cấu trúc users đồng bộ môi trường dev.

#### Đề xuất kỹ thuật
- Sử dụng `migrate-mongo` cho dự án Node + MongoDB.
- Tạo migration tạo index và ràng buộc ở collection `users`:
  - Unique index: `email`
  - Unique sparse index: `google_sub` (nếu có)
  - Index: `role`, `created_at`

#### Nội dung migration cần có
1. Tạo collection `users` nếu chưa tồn tại.
2. Tạo index unique cho `email`.
3. Tạo index phụ trợ query (`role`, `created_at`).
4. Seed role mặc định cho record cũ (nếu cần):
   - Nếu user chưa có role -> set `Staff`.

#### Điều kiện chấp nhận
- Chạy migration trên local không lỗi.
- Chạy lại migration không làm hư dữ liệu (idempotent).
- Team clone mới có thể khởi tạo DB bằng 1 command.

#### Lệnh dự kiến
- `npm run migrate:up`
- `npm run migrate:down`

---

### Task 2.1: Xây dựng endpoint xác thực Google

#### Yêu cầu
Tạo endpoint:
- `POST /api/v1/auth/google`

Client gửi:
- `id_token` (Google ID Token)

#### API contract đề xuất
Request body:
```json
{
  "id_token": "<google-id-token>"
}
```

Response 200:
```json
{
  "token": "<internal-jwt>",
  "user": {
    "id": "<uuid>",
    "email": "staff@hcmut.edu.vn",
    "full_name": "Nguyen Van A",
    "avatar_url": "https://...",
    "role": "Staff"
  }
}
```

Response 400:
- Thiếu `id_token`.

Response 401:
- ID token không hợp lệ/hết hạn.

Response 403:
- Email không thuộc domain được phép.

#### Điều kiện chấp nhận
- Endpoint nhận token và trả JWT nội bộ thành công với token hợp lệ.
- Mã lỗi và message rõ ràng cho 400/401/403.

---

### Task 2.2: Xử lý Domain Filter (Business Logic)

#### Yêu cầu
1. Xác thực tính hợp lệ của Google ID Token.
2. Trích xuất email.
3. Kiểm tra hậu tố email: bắt buộc kết thúc bằng `@hcmut.edu.vn`.
4. Nếu không hợp lệ -> HTTP 403 Forbidden + message cụ thể.

#### Đề xuất implementation
- Verify token với Google public keys (hoặc Google OAuth client verifier).
- Kiểm tra các claim quan trọng:
  - `iss` hợp lệ
  - `aud` khớp `GOOGLE_CLIENT_ID`
  - `exp` còn hạn
  - `email_verified = true`
- Domain check:
  - `email.toLowerCase().endsWith('@hcmut.edu.vn')`

#### Message lỗi đề xuất
- `403 FORBIDDEN`: `Only @hcmut.edu.vn staff accounts are allowed.`

#### Điều kiện chấp nhận
- Token hợp lệ + đúng domain -> qua tiếp business flow.
- Token hợp lệ + sai domain -> 403.
- Token không hợp lệ -> 401.

---

### Task 2.3: Quản lý hồ sơ người dùng và phiên làm việc

#### Yêu cầu
- Query user theo email.
- Nếu chưa tồn tại -> Insert mới với thông tin Google:
  - `full_name`, `email`, `avatar_url`, `role=Staff`.
- Tạo JWT nội bộ và trả về cho client.

#### Đề xuất flow chi tiết
1. Nhận `id_token`.
2. Verify Google ID token.
3. Domain filter (`@hcmut.edu.vn`).
4. Upsert user:
   - Tìm theo `email`.
   - Nếu không có: tạo mới.
   - Nếu có: cập nhật `full_name`, `avatar_url`, `last_login_at`.
5. Ký JWT nội bộ với claim:
   - `sub` = user id
   - `email`
   - `role`
6. Trả response (`token`, `user`).

#### Cấu hình JWT
- `JWT_SECRET`
- `JWT_ALGORITHM`
- `JWT_EXPIRES_IN`

#### Điều kiện chấp nhận
- User mới được tạo tự động lần đầu login.
- User cũ đăng nhập lại không tạo trùng.
- JWT dùng để truy cập route `requireJWT` hiện tại.

## 5) Thay đổi file dự kiến
- `api/models/User.js`: bổ sung field mới và index.
- `api/middleware/auth.js`: thêm logic verify Google token + issue JWT.
- `api/routes/auth.js`: thêm route `POST /api/v1/auth/google`.
- `api/server.js`: mount route versioned nếu cần (`/api/v1`).
- `api/package.json`: bổ sung script migration.
- `api/migrations/*`: migration tạo index và update dữ liệu cũ.

## 6) Biến môi trường cần bổ sung
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET` (nếu dùng OAuth code flow)
- `ALLOWED_STAFF_DOMAIN=hcmut.edu.vn`
- `JWT_SECRET`
- `JWT_ALGORITHM`
- `JWT_EXPIRES_IN`

## 7) Test plan
- Case 1: Token hợp lệ + email `@hcmut.edu.vn` -> 200 + JWT.
- Case 2: Token hợp lệ + email ngoài domain -> 403.
- Case 3: Token hết hạn/sai aud -> 401.
- Case 4: User mới -> tạo record mới.
- Case 5: User cũ -> cập nhật profile, không duplicate.
- Case 6: JWT mới truy cập route bảo vệ thành công.

## 8) Kế hoạch triển khai (timeline gợi ý)
- Ngày 1:
  - Chốt schema + migration + env.
- Ngày 2:
  - Implement endpoint `/api/v1/auth/google` + domain filter.
- Ngày 3:
  - Upsert user + issue JWT + unit/integration tests.
- Ngày 4:
  - UAT với frontend, hardening lỗi, rollout staging.

## 9) Rủi ro và giảm thiểu
- Rủi ro duplicate account do chênh email case:
  - Giảm thiểu: normalize lowercase + unique index.
- Rủi ro token verify sai cấu hình `aud`:
  - Giảm thiểu: validate env startup.
- Rủi ro route mới không tương thích frontend cũ:
  - Giảm thiểu: giữ route cũ song song trong giai đoạn chuyển đổi.

## 10) Definition of Done
- Hoàn tất task 1.1, 1.2, 2.1, 2.2, 2.3 với test pass.
- Có migration và script chạy trên local/staging.
- Có tài liệu API contract và message lỗi.
- Frontend đăng nhập Google thành công cho staff domain hợp lệ.
