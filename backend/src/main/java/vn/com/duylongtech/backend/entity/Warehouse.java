package vn.com.duylongtech.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "warehouses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Warehouse {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name; // e.g., "Kho tổng", "Kho Giải Phóng"

    private String address;

    private String type; // e.g., "Sales", "Warranty", "Repair"
}
