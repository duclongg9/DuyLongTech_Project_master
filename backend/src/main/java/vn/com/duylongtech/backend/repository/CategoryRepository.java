package vn.com.duylongtech.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.com.duylongtech.backend.entity.Category;

public interface CategoryRepository extends JpaRepository<Category, Long> {
}
