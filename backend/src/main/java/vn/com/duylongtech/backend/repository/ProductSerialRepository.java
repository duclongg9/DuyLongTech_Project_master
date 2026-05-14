package vn.com.duylongtech.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import vn.com.duylongtech.backend.entity.ProductSerial;
import java.util.List;
import java.util.Optional;

public interface ProductSerialRepository extends JpaRepository<ProductSerial, Long> {
    Optional<ProductSerial> findBySerialNumber(String serialNumber);

    List<ProductSerial> findByProductIdOrderByCreatedAtDesc(Long productId);

    List<ProductSerial> findByLifecycleStatus(String status);

    // Tìm hàng sắp hết bảo hành
    @Query("SELECT ps FROM ProductSerial ps WHERE ps.warrantyEnd <= CURRENT_DATE AND ps.lifecycleStatus = 'SOLD'")
    List<ProductSerial> findExpiredWarranties();
}
