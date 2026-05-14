# 🐳 DuyLongTech Docker One-Click Guide

Tất cả cấu hình Docker đã được gom vào thư mục `/docker-setup`. Bạn có thể chạy dự án ngay lập tức bằng các cách sau:

---

## ⚡ Chạy nhanh (Recommended)

### Cách 1: Sử dụng VS Code Task (Phím tắt)
1.  Nhấn **`Ctrl + Shift + B`**.
2.  Chọn **`🐳 Docker: Up (Build & Run)`**.

### Cách 2: Sử dụng Script (Bấm chuột)
Tôi đã tạo tệp lệnh ở thư mục gốc, bạn chỉ cần chuột phải vào file và chọn **Run with PowerShell**:
*   **[RUN_PROJECT.ps1](./RUN_PROJECT.ps1)**

---

## 🛠 Lệnh Terminal (Dành cho Dev)

Nếu bạn muốn chạy thủ công, hãy copy lệnh này vào terminal ở thư mục gốc:

```powershell
docker-compose -f docker-setup/docker-compose.yml up --build
```

---

## 🌐 Địa chỉ truy cập

| Service | Địa chỉ |
| :--- | :--- |
| **Frontend** | [http://localhost:5173](http://localhost:5173) |
| **Backend API** | [http://localhost:8080/api](http://localhost:8080/api) |
| **MySQL DB Port** | `3307` |

---

## 🧹 Dọn dẹp hệ thống

Để dừng dự án và xóa sạch dữ liệu (Reset DB):
```powershell
docker-compose -f docker-setup/docker-compose.yml down -v
```

---

> **Lưu ý**: Khi sửa code ở thư mục `backend/` hoặc `frontend/`, hệ thống sẽ tự động cập nhật bên trong Docker nhờ vào cấu hình Volume Mounting.
