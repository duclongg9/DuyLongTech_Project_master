package vn.com.duylongtech.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- Thông tin cơ bản ---
    @Column(nullable = false)
    private String name;         // "Dell Latitude 7420"

    // Đánh dấu thiết bị dành riêng cho cứu nét (Backup Device)
    @Column(name = "is_backup_device")
    private Boolean isBackupDevice;

    private String brand;        // Dell, HP, Lenovo, Apple, Asus...
    private String model;        // Model code: "7420", "X1C Gen9"
    private String sku;          // Mã SKU nội bộ

    // --- Tình trạng máy (quan trọng với hàng cũ) ---
    @Column(name = "product_condition")
    private String condition;    // NEW, LIKE_NEW_99, GOOD_95, GOOD_90, FAIR_80
    private Integer conditionPct; // 99, 95, 90, 80...
    @Column(columnDefinition = "TEXT")
    private String conditionNote; // "Xước nhẹ nắp máy, phím A mờ chữ"

    // --- CPU (nhiều tiền tố phức tạp) ---
    private String cpuBrand;      // Intel, AMD, Apple
    private String cpuFamily;     // Core i5, Core i7, Ryzen 5, M1, M2...
    private String cpuGeneration; // 10th, 11th, 12th, Zen3, Zen4...
    private String cpuModel;      // i5-1145G7, Ryzen 7 5850U, M2 Pro...
    private String cpuFullName;   // "Intel Core i5-1145G7 (4C/8T, 2.6-4.4GHz)"
    private Integer cpuCores;
    private Integer cpuThreads;
    private String cpuBaseClock;  // "2.6 GHz"
    private String cpuBoostClock; // "4.4 GHz"
    private String cpuTdp;        // "15W", "28W", "45W"

    // --- RAM ---
    private String ramAmount;     // "8GB", "16GB", "32GB"
    private String ramType;       // DDR4, DDR5, LPDDR4X, LPDDR5
    private String ramSpeed;      // "3200MHz", "4800MHz"
    private Boolean ramSlots;     // còn slot mở rộng?

    // --- Lưu trữ ---
    private String storageMain;   // "512GB NVMe SSD"
    private String storageType;   // NVMe_M2, SATA_SSD, HDD
    private String storageExtra;  // "HDD 1TB" (nếu có ổ phụ)
    private Boolean storageSlot;  // còn khe cắm thêm?

    // --- Màn hình ---
    private String displaySize;   // "14\"", "15.6\""
    private String displayRes;    // "FHD 1920×1080", "2K 2560×1440"
    private String displayPanel;  // IPS, OLED, TN, VA
    private String displayHz;     // "60Hz", "120Hz", "144Hz"
    private Boolean displayTouch; // cảm ứng?

    // --- Đồ họa ---
    private String gpuType;       // INTEGRATED, DEDICATED
    private String gpuName;       // "Intel Iris Xe", "NVIDIA RTX 3050 4GB"

    // --- Kết nối & pin ---
    private String ports;         // "2x USB-A, 1x USB-C, HDMI, SD"
    private String battery;       // "57Wh / ~8h thực tế"
    private String weight;        // "1.4 kg"
    private String os;            // "Windows 11 Pro", "macOS Ventura", "No OS"
    private String keyboard;      // "Đèn nền", "Không đèn"

    // --- Giá & bán hàng (quan trọng với hàng cũ) ---
    private BigDecimal basePrice;        // Giá hiển thị
    private BigDecimal minPrice;         // Giá sàn (staff thấy)
    private BigDecimal costPrice;        // Giá nhập (admin thấy)
    private Boolean priceNegotiable;     // true = phải hỏi giá trước khi bán
    private Boolean callForPrice;        // true = hiển thị "Liên hệ"
    @Column(columnDefinition = "TEXT")
    private String priceNote;            // "Giá có thể thay đổi theo thị trường"

    // --- Bảo hành (rất quan trọng với hàng cũ) ---
    private String warrantyType;         // SHOP, BRAND, NONE
    private Integer warrantyMonths;      // 0, 3, 6, 12, 24...
    private LocalDate warrantyStartDate; // Ngày bắt đầu tính BH
    private LocalDate warrantyEndDate;   // Ngày kết thúc BH
    @Column(columnDefinition = "TEXT")
    private String warrantyNote;         // "BH tại cửa hàng, không BH màn hình"
    private Boolean warrantyVoidIfOpen;  // Mất BH nếu tháo máy

    // --- Serial & Kho ---
    private String serialNumber;
    private String imei;
    private String status;               // AVAILABLE, SOLD, WARRANTY, REPAIR, RESERVED, DAMAGED
    private Integer quantity;            // Số lượng tồn

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(columnDefinition = "TEXT")
    private String description;
    private String imageUrl;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist protected void onCreate() { createdAt = LocalDateTime.now(); updatedAt = LocalDateTime.now(); }
    @PreUpdate  protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}
