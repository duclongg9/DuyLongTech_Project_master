package vn.com.duylongtech.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.com.duylongtech.backend.entity.DeviceComponent;
import java.util.List;

public interface DeviceComponentRepository extends JpaRepository<DeviceComponent, Long> {
    List<DeviceComponent> findByProductId(Long productId);
}
