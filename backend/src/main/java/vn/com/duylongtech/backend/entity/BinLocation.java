package vn.com.duylongtech.backend.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Bin Location — Vị trí kho vật lý (Phân khu kho)
 * Chuẩn hóa theo: Khu vực → Kệ → Tầng → Ô (Zone-Rack-Level-Bin)
 */
@Entity
@Table(name = "bin_locations", uniqueConstraints = @UniqueConstraint(columnNames = {"warehouse_id", "binCode"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BinLocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;

    // Mã Ô/Vị trí: "A1-R01-L1-B01"
    @Column(nullable = false)
    private String binCode;

    // Tên khu vực hiển thị
    private String zoneName;

    // Phân khu: BULKY (cồng kềnh), HIGH_VALUE (giá trị cao), SMALL_PARTS (linh kiện nhỏ), TECHNICAL (kỹ thuật/QC)
    @Column(nullable = false)
    private String zoneType;

    // Ghi chú điều kiện bảo quản đặc biệt
    private String storageNote;     // "Tủ kính khóa, camera giám sát", "Thảm chống ESD"

    // Điều kiện môi trường yêu cầu
    private Boolean requiresEsdProtection;   // Cần chống tĩnh điện?
    private Boolean requiresAntiStaticBag;   // Cần túi chống tĩnh?
    private Integer maxHumidityPercent;      // Độ ẩm tối đa cho phép (%)
    private Boolean requiresLock;            // Cần khóa?

    // Sức chứa
    private Integer maxCapacity;
    private Integer currentCount;

    private Boolean isActive;
}
