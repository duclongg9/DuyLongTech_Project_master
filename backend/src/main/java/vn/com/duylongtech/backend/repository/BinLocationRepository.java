package vn.com.duylongtech.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.com.duylongtech.backend.entity.BinLocation;
import java.util.List;

public interface BinLocationRepository extends JpaRepository<BinLocation, Long> {
    List<BinLocation> findByWarehouseIdAndIsActiveTrue(Long warehouseId);
    List<BinLocation> findByZoneType(String zoneType);
}
