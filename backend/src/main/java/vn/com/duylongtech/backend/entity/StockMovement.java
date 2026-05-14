package vn.com.duylongtech.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Sổ cái kho (Inventory Ledger).
 * Mỗi record = 1 biến động kho. KHÔNG BAO GIỜ update/delete, chỉ INSERT.
 * Tồn kho = SUM(quantityChange) GROUP BY product, warehouse, itemStatus.
 */
@Entity
@Table(name = "stock_movements", indexes = {
    @Index(name = "idx_sm_product", columnList = "product_id"),
    @Index(name = "idx_sm_warehouse", columnList = "warehouse_id"),
    @Index(name = "idx_sm_date", columnList = "movementDate")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StockMovement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;

    // +N = nhập, -N = xuất. Không bao giờ = 0
    @Column(nullable = false)
    private Integer quantityChange;

    // Trạng thái hàng: AVAILABLE, RESERVED, WARRANTY_HOLD, REPAIR, DAMAGED, SOLD
    @Column(nullable = false)
    private String itemStatus;

    // Lý do: PURCHASE (nhập mới), SALE (bán), RESERVE (giữ chỗ),
    // UNRESERVE (hủy giữ), WARRANTY_IN (nhận BH), WARRANTY_OUT (trả BH),
    // TRANSFER (chuyển kho), DAMAGE (hỏng), RETURN (trả hàng)
    @Column(nullable = false)
    private String reason;

    // Mã tham chiếu: ORDER-123, TICKET-456, TRANSFER-789
    private String referenceId;

    // Ai thực hiện
    private String performedBy;

    // Ghi chú thêm
    @Column(columnDefinition = "TEXT")
    private String note;

    // Thông tin Nhập kho mở rộng (WMS)
    private String supplier;          // Nhà cung cấp (FPT, Thủy Linh...)
    private BigDecimal unitPrice;     // Đơn giá nhập
    private String unitOfMeasure;     // Đơn vị tính (chiếc, bộ, khay...)

    @Column(nullable = false)
    private LocalDateTime movementDate;

    @PrePersist
    protected void onPersist() {
        if (movementDate == null) movementDate = LocalDateTime.now();
    }
}
