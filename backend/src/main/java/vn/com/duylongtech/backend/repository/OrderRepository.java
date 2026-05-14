package vn.com.duylongtech.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.com.duylongtech.backend.entity.Order;

public interface OrderRepository extends JpaRepository<Order, Long> {
}
