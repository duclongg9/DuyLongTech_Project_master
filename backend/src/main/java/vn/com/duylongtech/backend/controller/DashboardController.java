package vn.com.duylongtech.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.com.duylongtech.backend.repository.ProductRepository;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    private final ProductRepository productRepository;

    public DashboardController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        // Thống kê doanh thu theo thương hiệu (Giả lập dữ liệu cho biểu đồ)
        Map<String, Long> brandSales = Map.of(
            "Dell", 150000000L,
            "ThinkPad", 210000000L,
            "HP", 85000000L,
            "Apple", 320000000L
        );

        // Thống kê tồn kho
        long totalProducts = productRepository.count();
        
        return ResponseEntity.ok(Map.of(
            "revenueByBrand", brandSales,
            "totalProducts", totalProducts,
            "aiInsight", "Dòng MacBook đang có tốc độ tăng trưởng 15% trong tháng này. Khuyến nghị nhập thêm Dell Precision để phục vụ nhu cầu đồ họa cuối năm."
        ));
    }
}
