package vn.com.duylongtech.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Log giao dịch ví Shipper — mỗi đơn giao / mỗi lần thanh toán
 */
@Entity
@Table(name = "transaction_logs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TransactionLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "wallet_id", nullable = false)
    private ShipperWallet wallet;

    // DELIVERY_COLLECT, ADMIN_SETTLE, ADMIN_ADJUST
    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private BigDecimal amount;

    private BigDecimal balanceBefore;
    private BigDecimal balanceAfter;

    private String orderId;        // Mã đơn hàng liên quan
    private String note;           // Ghi chú (VD: "Thanh toán phiếu chi #123")
    private String performedBy;    // Username người thực hiện

    private String proofImageUrl;  // URL ảnh proof of delivery
    private Double latitude;
    private Double longitude;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
