---
title: "Triển khai Frontend ReactJS lên Amazon S3"
weight: 1
---

## 1. Tổng quan kiến trúc (Overview)
Trong dự án Hệ thống Đặt xe (Serverless Car Booking), phần giao diện người dùng (Frontend) được phát triển bằng thư viện **ReactJS** (công cụ Vite). Để tối ưu hóa chi phí và tăng tốc độ phân phối nội dung, thay vì sử dụng máy chủ ảo (EC2) truyền thống, dự án áp dụng giải pháp lưu trữ tĩnh (Static Website Hosting) thông qua dịch vụ **Amazon S3**.

![Sơ đồ kiến trúc Frontend S3](/images/đường-dẫn-ảnh-sơ-đồ-của-bạn.png)
*(Lưu ý: Chèn ảnh sơ đồ kiến trúc tổng quan vào đây)*

## 2. Các bước triển khai (Step-by-step)

### Bước 1: Đóng gói mã nguồn (Build source code)
Trước khi đưa lên môi trường Cloud, mã nguồn ReactJS cần được biên dịch thành các file tĩnh (HTML, CSS, JS) để trình duyệt có thể đọc được.
- Thực thi lệnh: `npm run build`
- Toàn bộ mã nguồn đã được tối ưu và nén lại trong thư mục `dist`.

### Bước 2: Cấu hình Amazon S3 Bucket
1. Khởi tạo một Bucket mới với tên miền duy nhất (ví dụ: `car-booking-hung2026`).
2. **Cấp quyền truy cập công khai (Public Access):**
   - Tắt tính năng *Block all public access* để cho phép người dùng Internet truy cập vào trang web.
3. **Kích hoạt Static Website Hosting:**
   - Trong tab *Properties*, bật tính năng *Static website hosting*.
   - Khai báo **Index document** là `index.html`.

![Cấu hình Static Website Hosting](/images/đường-dẫn-ảnh-chụp-màn-hình-s3-của-bạn.png)
*(Lưu ý: Chèn bức ảnh giao diện S3 cấu hình index.html của bạn vào đây)*

### Bước 3: Phân quyền Bucket Policy
Để người dùng có thể tải được các file tĩnh về trình duyệt, Bucket cần được gắn một Policy cho phép hành động `s3:GetObject` trên toàn bộ tài nguyên:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::car-booking-hung2026/*"
        }
    ]
}