package vn.com.duylongtech.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Ví công nợ của Shipper — theo dõi số dư tiền ship thu hộ
 */
@Entity
@Table(name = "shipper_wallets")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ShipperWallet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    private BigDecimal balance; // Số dư chờ thanh toán

    @Column(nullable = false)
    private BigDecimal totalCollected; // Tổng đã thu (lifetime)

    @Column(nullable = false)
    private BigDecimal totalSettled; // Tổng đã thanh toán cho shop

    private Integer deliveryCount; // Số đơn đã giao
    private LocalDateTime lastDeliveryAt;
    private LocalDateTime lastSettledAt;

    @PrePersist
    protected void onCreate() {
        if (balance == null) balance = BigDecimal.ZERO;
        if (totalCollected == null) totalCollected = BigDecimal.ZERO;
        if (totalSettled == null) totalSettled = BigDecimal.ZERO;
        if (deliveryCount == null) deliveryCount = 0;
    }
}
