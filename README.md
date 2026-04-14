# 🏢 Hệ thống Đặt phòng họp CSE (CSE Room Booking System)

[![Status](https://img.shields.io/badge/Status-In_Development-blue.svg)](#)
[![Version](https://img.shields.io/badge/Version-1.0.0-lightgrey.svg)](#)

## 🌟 Tầm nhìn (Vision)
Xây dựng nền tảng quản lý và đặt lịch phòng họp chuyên nghiệp, hiện đại, nhằm tối ưu hóa quy trình vận hành và sử dụng không gian làm việc cho **Khoa Khoa học & Kỹ thuật Máy tính**.

## 👥 Đối tượng sử dụng
Hệ thống được thiết kế với cơ chế phân quyền (RBAC - Role-Based Access Control) rõ ràng cho hai nhóm người dùng chính:

* **🛡️ Admin**: Ban lãnh đạo khoa, Cán bộ quản lý phòng.
* **👨‍🏫 Staff**: Cán bộ, Giảng viên và Nhân viên trực thuộc Khoa.

---

## ✨ Tính năng cốt lõi (Core Features)

### 🧑‍💻 Dành cho Staff (Người dùng nội bộ)
* **🔐 Đăng nhập SSO**: Tích hợp xác thực an toàn thông qua **Google Workspace** (Sử dụng email nội bộ).
* **📅 Tra cứu lịch trực quan**: Giao diện Calendar/Timeline cho phép xem bảng giờ phòng trống một cách trực quan.
* **📝 Đăng ký đặt phòng**: Flow đặt phòng tối ưu, cho phép chọn phòng theo sức chứa, khung giờ và ghi chú mục đích sử dụng.
* **👤 Quản lý cá nhân**: Trang Profile riêng để theo dõi, chỉnh sửa hoặc hủy các lịch sử đặt phòng của cá nhân.

### ⚙️ Dành cho Admin (Quản trị viên)
* **✅ Phê duyệt yêu cầu**: Xử lý các luồng yêu cầu đặt phòng (Approve/Reject) trực tiếp trên hệ thống.
* **🔍 Giám sát lịch trình**: Xem chi tiết thông tin của người đặt, mục đích họp và thời gian cụ thể của từng phòng.
* **🏢 Cấu hình danh sách phòng**: Thêm, sửa, xóa thông tin phòng họp (Tên phòng, vị trí, sức chứa, trang thiết bị đi kèm).
* **📊 Thống kê & Báo cáo**: Giao diện Dashboard quản trị cung cấp số liệu thống kê về tần suất sử dụng phòng, tỷ lệ phê duyệt và hiệu suất khai thác.

---

## 🛠 Tech Stack (Kiến trúc & Công nghệ đề xuất)

Hệ thống được định hướng xây dựng theo kiến trúc **Modular Design**, tuân thủ nguyên tắc SOLID nhằm đảm bảo tính mở rộng và dễ bảo trì trong tương lai.

* **Frontend**: React.js kết hợp TailwindCSS.
* **Backend**: FastAPI (Python).
* **Database**: PostgreSQL.
