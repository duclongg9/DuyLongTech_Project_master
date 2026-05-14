# [System Specification] Hệ thống Bán lẻ Máy tính Đa nền tảng Tích hợp AI

Tài liệu này tóm tắt toàn bộ yêu cầu, nghiệp vụ và định hướng thiết kế cho hệ thống bán lẻ linh kiện/máy tính (Web & App) có tích hợp AI.

## 1. Tổng quan Dự án (Project Overview)
- **Tên dự án:** Hệ thống bán sản phẩm máy tính đa nền tảng (Web + Mobile App) tích hợp AI hỗ trợ tư vấn mua hàng, phân tích kinh doanh, và tạo nội dung SEO.
- **Mục tiêu:** Giải quyết bài toán quản lý hàng nghìn SKU phức tạp, tối ưu quy trình bảo hành/sửa chữa tại quầy và cá nhân hóa trải nghiệm khách hàng bằng AI.

---

## 2. Bối cảnh & Vấn đề (Context & Pain Points)
- **Sản phẩm đặc thù:** Số lượng SKU lớn, nhiều biến thể cấu hình (RAM, SSD, GPU...), thông số kỹ thuật phức tạp.
- **Khó khăn khách hàng:** Khó tự lựa chọn cấu hình phù hợp với ngân sách và nhu cầu thực tế.
- **Khó khăn vận hành:** 
    - Quản lý kho "cồng kềnh" (nhiều trạng thái: hàng bán, hàng lỗi, hàng bảo hành).
    - Viết nội dung SEO tốn thời gian và dễ sai lệch thông số kỹ thuật.
    - Quy trình tiếp nhận bảo hành thủ công, dễ nhầm lẫn.

---

## 3. Kiến trúc Hệ thống (System Architecture)
- **Web (Customer-Facing):** Môi trường chính cho khách hàng tra cứu, đặt hàng và yêu cầu hỗ trợ.
- **App (Internal Staff):** Ứng dụng di động dành cho Nhân viên Kho/Kỹ thuật/Bảo hành, tập trung vào quét mã (Scan), cập nhật trạng thái nhanh và quản lý hiện trường.
- **Backend & AI Service:** Hệ thống trung tâm quản lý Database, xử lý Logic nghiệp vụ và cung cấp các Model AI (Tư vấn, SEO, Analytics).

---

## 4. Đối tượng sử dụng (Roles & Permissions)
| Vai trò | Phạm vi sử dụng | Chức năng chính |
| :--- | :--- | :--- |
| **Khách hàng (Guest/Customer)** | Web | Xem sản phẩm, dùng AI tư vấn, đặt hàng, tra cứu bảo hành. |
| **NV Bảo hành/Kỹ thuật** | App | Quét QR tiếp nhận ticket, kiểm tra tình trạng, báo giá sửa chữa, cập nhật trạng thái xử lý. |
| **NV Kho (Inventory)** | App/Web | Nhập/xuất/chuyển kho theo Serial, quản lý hàng lỗi/hàng bảo hành. |
| **Quản trị (Admin/Manager)** | Web | Quản lý sản phẩm, cấu hình AI SEO, xem Dashboard báo cáo chuyên sâu. |

---

## 5. Luồng nghiệp vụ trọng tâm (Core Workflows)

### 5.1 Quản lý Bán hàng & Cá nhân hóa (Web)
- **Bộ lọc thông minh:** Lọc theo thông số chi tiết (CPU, RAM, Card đồ họa...).
- **AI Shopping Assistant:** 
    - *Input:* Ngân sách, mục đích (Gaming/Văn phòng), mức độ sử dụng.
    - *Output:* Gợi ý 1-2 sản phẩm tối ưu kèm lý do thuyết phục và link trực tiếp.

### 5.2 Tiếp nhận Bảo hành/Sửa chữa tại quầy (App - Điểm nhấn)
1. **Tem QR/Barcode:** Sử dụng tem in sẵn (mã duy nhất) dán lên sản phẩm khi tiếp nhận.
2. **Quy trình Ticket:** 
    - Tìm khách qua SĐT/Email -> Chọn sản phẩm khách đã mua từ lịch sử.
    - Hệ thống tự check thời hạn bảo hành.
    - Chụp ảnh tình trạng, ghi chú linh kiện đi kèm, hẹn ngày trả.
3. **Xử lý Service:** Nếu hết bảo hành, chuyển sang trạng thái "Sửa chữa tính phí" (Service) -> Báo giá -> Chờ khách duyệt trên Web/Zalo.
4. **Từ chối bảo hành:** Chọn lý do cấu hình sẵn (Cháy nổ, rách tem, tác động vật lý...) + Ảnh bằng chứng.

### 5.3 Quản lý Kho Đa trạng thái (Inventory Ledger)
- **Tách kho theo trạng thái:** `Available` (Sẵn sàng bán), `Reserved` (Đã giữ chỗ), `WarrantyHold` (Đang bảo hành), `Damaged` (Hàng lỗi), `Returned` (Hàng trả).
- **Stock Movement:** Mọi biến động kho phải có "Lý do" (Sale out, Transfer, Repair parts out...) để phục vụ truy xuất.

---

## 6. Ứng dụng AI cụ thể (AI Implementation)
- **AI Consultation:** Chuyển đổi ngôn ngữ tự nhiên của khách hàng thành tiêu chí kỹ thuật để chấm điểm sản phẩm trong Database.
- **AI SEO Generator:** Tự động soạn thảo Draft nội dung sản phẩm (FAQ, Meta Description, Bảng nổi bật) dựa trên Specs đã chuẩn hóa, đảm bảo độ chính xác 100% về thông số.
- **AI Analytics:** Dự báo xu hướng nhập hàng và cảnh báo tồn kho dựa trên dữ liệu lịch sử.

---

## 7. Ngôn ngữ Thiết kế & Giao diện (Design System)

### 7.1 Hệ màu & Thẩm mỹ (Aesthetics)
- **Background:** Bạc xám (#F8F9FA) - Tạo sự sang trọng, không gây lóa mắt.
- **Accent Color:** Vàng Pastel (#F4D03F) - Điểm nhấn cho nút CTA (Mua hàng, Gọi điện).
- **Text:** Xám đậm (#333333) - Giảm tương phản gắt, dễ đọc thông số kỹ thuật lâu.
- **Style:** Bo góc (8px), Padding rộng (40px+), phong cách Showroom hiện đại.

### 7.2 Cấu trúc Trang chủ (Homepage)
- **Sticky Header:** Thanh tìm kiếm cực dài ("Bạn cần tìm máy Dell, ThinkPad hay HP?").
- **Hero Section:** Video loop không gian showroom thực tế + Bộ lọc Persona (Văn phòng/Đồ họa/Sinh viên).
- **Trust Band:** Dải biểu tượng cam kết (Bảo hành 12 tháng, 1 đổi 1 trong 7 ngày).

### 7.3 Trang Chi tiết Sản phẩm (PDP)
- **Layout 55/45:** 
    - Trái: Gallery ảnh độ phân giải cao + Video quay cận cảnh thực tế sản phẩm 99%.
    - Phải: Khu vực "Tự Build" cấu hình (RAM, SSD). 
- **Real-time Pricing:** Giá tiền phải nhảy số (hiệu ứng số chạy) lập tức khi khách thay đổi RAM/SSD mà không load lại trang.
- **Sticky Footer:** Nút tư vấn Zalo/Messenger luôn hiện diện để chốt Sale nhanh.

---

## 8. Phạm vi MVP (Minimum Viable Product)
- **Web:** Catalog, bộ lọc, đặt hàng, trang tra cứu yêu cầu bảo hành.
- **App:** Scan tem tạo Ticket, quản lý trạng thái bảo hành, phân quyền NV.
- **Warehouse:** Quản lý tồn kho theo trạng thái và phiếu kho Movement.
- **AI:** Module tư vấn gợi ý và module tạo SEO Draft cơ bản cho Admin.
