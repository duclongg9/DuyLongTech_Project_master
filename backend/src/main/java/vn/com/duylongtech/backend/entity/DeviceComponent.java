package vn.com.duylongtech.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * Linh kiện con bên trong một thiết bị (Mã Con).
 * Mỗi Product (Mã Mẹ) chứa nhiều DeviceComponent.
 * Ví dụ: 1 máy Dell Latitude → Mainboard XYZ, CPU i5-1145G7, RAM Samsung 16GB, SSD WD 512GB
 */
@Entity
@Table(name = "device_components")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DeviceComponent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @JsonIgnore
    private Product product;

    // Loại linh kiện: MAINBOARD, CPU, RAM, GPU, SSD, WIFI, BATTERY, SCREEN
    @Column(nullable = false)
    private String componentType;

    // Tên hiển thị: "Intel Core i5-1145G7"
    @Column(nullable = false)
    private String name;

    // Serial Number riêng của linh kiện
    private String serialNumber;

    // Nhà sản xuất linh kiện
    private String manufacturer;

    // Thông số kỹ thuật bổ sung
    private String specs;

    // Tình trạng: OK, FAULTY, REPLACED
    @Column(nullable = false)
    private String status;

    // Ghi chú kỹ thuật
    private String techNote;
}
