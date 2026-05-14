package vn.com.duylongtech.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.com.duylongtech.backend.entity.Warehouse;

public interface WarehouseRepository extends JpaRepository<Warehouse, Long> {
}
