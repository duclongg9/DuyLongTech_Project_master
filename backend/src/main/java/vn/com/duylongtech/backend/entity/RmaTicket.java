package vn.com.duylongtech.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * RMA Ticket — Phiếu Tiếp Nhận Bảo Hành / Đổi Trả
 * Áp dụng cho: Linh kiện lỗi gửi hãng, sản phẩm khách trả, hàng hỏng nội bộ
 * KHÔNG BAO GIỜ delete, chỉ thay đổi status
 */
@Entity
@Table(name = "rma_tickets")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RmaTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Mã phiếu RMA nội bộ (auto-gen: RMA-2026-0001)
    @Column(unique = true, nullable = false)
    private String rmaCode;

    // ===== NGUỒN GỐC =====
    // RMA_CUSTOMER (khách đem vào), RMA_INTERNAL (nội bộ phát hiện), RMA_VENDOR (trả lại hãng)
    @Column(nullable = false)
    private String rmaType;

    // ===== LIÊN KẾT =====
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "component_id")
    private DeviceComponent component;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private User customer;

    // Serial Number của hàng đang xử lý RMA
    private String serialNumber;

    // ===== THÔNG TIN TÌNH TRẠNG VẬT LÝ (TẠI THỜI ĐIỂM TIẾP NHẬN) =====
    @Column(columnDefinition = "TEXT")
    private String physicalConditionNote;   // Mô tả tình trạng: "Nứt góc vỏ nhựa, bàn phím còn tốt"

    // URL ảnh chụp tình trạng (lưu dạng danh sách URL cách nhau bằng dấu |)
    @Column(columnDefinition = "TEXT")
    private String evidencePhotoUrls;

    // ===== PHÂN LOẠI LỖI (QUAN TRỌNG ĐỂ LOẠI TRỪ BẢO HÀNH) =====
    // FAULT_TYPE: USER_DAMAGE (lỗi người dùng), HARDWARE_DEFECT (lỗi phần cứng),
    //             LIQUID_DAMAGE (vào nước), RUST (rỉ sét / ẩm), ESD_DAMAGE (tĩnh điện),
    //             INSECT (côn trùng), PSU_DAMAGE (nguồn kém), UNKNOWN
    @Column(nullable = false)
    private String faultType;

    @Column(columnDefinition = "TEXT")
    private String faultDescription;   // Mô tả kỹ thuật lỗi cụ thể

    // ===== QUYẾT ĐỊNH BẢO HÀNH =====
    // WARRANTY_VALID: Được bảo hành | WARRANTY_EXCLUDED: Loại trừ | CHARGEABLE: Sửa có phí
    @Column(nullable = false)
    private String warrantyDecision;

    @Column(columnDefinition = "TEXT")
    private String warrantyExclusionReason;  // Lý do loại trừ BH (quan trọng để tránh tranh chấp)

    // ===== TRẠNG THÁI XỬ LÝ =====
    // RECEIVED → DIAGNOSING → APPROVED → SENT_TO_VENDOR → REPAIRED → RETURNED → CLOSED | REJECTED
    @Column(nullable = false)
    private String status;

    // Tên hãng/trung tâm bảo hành bên ngoài gửi đến
    private String vendorName;
    private String vendorTicketCode;  // Mã phiếu của hãng (Dell, HP, Asus...)
    private LocalDate vendorSentDate;
    private LocalDate vendorExpectedReturnDate;
    private LocalDate vendorActualReturnDate;

    // ===== TÀI CHÍNH (nếu sửa có phí) =====
    private BigDecimal estimatedCost;
    private BigDecimal actualCost;
    private Boolean isPaidByCustomer;

    // ===== KIỂM TOÁN =====
    private String receivedBy;      // Nhân viên tiếp nhận
    private String technicianNote;  // Ghi chú kỹ thuật viên sau chẩn đoán

    @Column(nullable = false)
    private LocalDateTime receivedAt;

    private LocalDateTime updatedAt;
    private LocalDateTime closedAt;

    @PrePersist
    protected void onCreate() {
        if (receivedAt == null) receivedAt = LocalDateTime.now();
        if (status == null) status = "RECEIVED";
    }

    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}
