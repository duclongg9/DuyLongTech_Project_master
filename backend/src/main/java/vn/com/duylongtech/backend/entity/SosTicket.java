package vn.com.duylongtech.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sos_tickets")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SosTicket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "backup_device_id")
    private Product backupDevice; // Thiết bị cho mượn

    @Column(nullable = false)
    private String status; // PENDING, DISPATCHED, RESOLVED

    private Double latitude;
    private Double longitude;
    
    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onPersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (status == null) status = "PENDING";
    }
}
