package vn.com.duylongtech.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * ProductSerial — Quản lý Serial Number từng đơn vị sản phẩm
 * Đây là trái tim của WMS ngành IT — mỗi chiếc máy/linh kiện là 1 record độc lập
 * Toàn bộ vòng đời: Nhập kho → Bán → Bảo hành → Thanh lý đều được ghi lại
 */
@Entity
@Table(name = "product_serials",
    indexes = { @Index(name = "idx_ps_serial", columnList = "serialNumber") })
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductSerial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    // Serial Number là khóa định danh vật lý — KHÔNG TRÙNG LẶP
    @Column(nullable = false)
    private String serialNumber;

    private String imei;  // Dành riêng cho laptop có modem 4G/5G

    // ===== VỊ TRÍ KHO =====
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bin_location_id")
    private BinLocation binLocation;

    // ===== TRẠNG THÁI VÒNG ĐỜI =====
    // IN_STOCK, RESERVED, SOLD, ON_LOAN (đang cho mượn SOS), 
    // UNDER_REPAIR, SENT_WARRANTY, DAMAGED, DISPOSED
    @Column(nullable = false)
    private String lifecycleStatus;

    // ===== THÔNG TIN NHẬP KHO =====
    private String supplier;
    private String purchaseInvoice;     // Mã hóa đơn nhập

    // ===== BẢO HÀNH =====
    private String warrantyType;        // SHOP, BRAND, NONE
    private java.time.LocalDate warrantyStart;
    private java.time.LocalDate warrantyEnd;

    // ===== LIÊN KẾT BÁN HÀNG =====
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sold_to_user_id")
    private User soldToUser;

    private LocalDateTime soldAt;
    private String saleOrderCode;       // Mã đơn hàng bán

    // ===== KIỂM TOÁN =====
    private String addedBy;             // Thủ kho nhập liệu
    @Column(nullable = false)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // ===== GHI CHÚ KỸ THUẬT =====
    @Column(columnDefinition = "TEXT")
    private String techNote;           // "Xước mặt đáy, bàn phím Spill"

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (lifecycleStatus == null) lifecycleStatus = "IN_STOCK";
    }

    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}
