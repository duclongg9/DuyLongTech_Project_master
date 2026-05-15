package vn.com.duylongtech.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.com.duylongtech.backend.entity.DeviceComponent;
import vn.com.duylongtech.backend.entity.Product;
import vn.com.duylongtech.backend.repository.DeviceComponentRepository;
import vn.com.duylongtech.backend.repository.ProductRepository;

import java.util.*;

/**
 * API cho App Kỹ thuật viên — Quét mã QR, tra cứu cây linh kiện, thông tin VIP.
 */
@RestController
@RequestMapping("/api/technician")
public class TechnicianController {

    private final ProductRepository productRepository;
    private final DeviceComponentRepository componentRepository;

    public TechnicianController(ProductRepository productRepository, DeviceComponentRepository componentRepository) {
        this.productRepository = productRepository;
        this.componentRepository = componentRepository;
    }

    /**
     * Quét QR → Tra cứu thiết bị theo Serial Number (Mã Mẹ)
     * Trả về: Thông tin máy + cây linh kiện + thông tin khách VIP
     */
    @GetMapping("/scan/{serialOrQr}")
    public ResponseEntity<?> scanDevice(@PathVariable String serialOrQr) {
        // Tìm sản phẩm theo Serial Number
        Optional<Product> optProduct = productRepository.findAll().stream()
                .filter(p -> serialOrQr.equals(String.valueOf(p.getId())))
                .findFirst();

        if (optProduct.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Không tìm thấy thiết bị với mã: " + serialOrQr));
        }

        Product product = optProduct.get();
        List<DeviceComponent> components = componentRepository.findByProductId(product.getId());

        // Build tree view data
        Map<String, Object> deviceTree = new LinkedHashMap<>();
        deviceTree.put("id", product.getId());
        deviceTree.put("name", product.getName());
        deviceTree.put("inStock", product.getInStock());
        deviceTree.put("imageUrl", product.getImageUrl());

        // Nhóm components theo type
        Map<String, List<Map<String, Object>>> groupedComponents = new LinkedHashMap<>();
        for (DeviceComponent c : components) {
            Map<String, Object> comp = new LinkedHashMap<>();
            comp.put("id", c.getId());
            comp.put("name", c.getName());
            comp.put("serialNumber", c.getSerialNumber());
            comp.put("manufacturer", c.getManufacturer());
            comp.put("specs", c.getSpecs());
            comp.put("status", c.getStatus());
            comp.put("techNote", c.getTechNote());
            groupedComponents.computeIfAbsent(c.getComponentType(), k -> new ArrayList<>()).add(comp);
        }
        deviceTree.put("components", groupedComponents);

        // Giả lập VIP check — trong thực tế query từ Order → Customer
        Map<String, Object> customerInfo = new LinkedHashMap<>();
        boolean isVip = product.getId() % 2 == 0; // Demo: sản phẩm ID chẵn = VIP
        customerInfo.put("isVip", isVip);
        if (isVip) {
            customerInfo.put("customerName", "Nguyễn Văn An");
            customerInfo.put("phone", "0912.345.678");
            customerInfo.put("vipSince", "2024-06-15");
            customerInfo.put("privileges", List.of(
                "⚡ Ưu tiên sửa chữa trong 2h",
                "🔄 Đổi máy mới nếu lỗi nặng trong 30 ngày",
                "🚚 Giao máy tận nơi sau bảo hành",
                "📞 Hotline riêng: 0988.000.111",
                "🎁 Giảm 20% phụ kiện kèm theo"
            ));
        } else {
            customerInfo.put("customerName", "Trần Thị Bình");
            customerInfo.put("phone", "0987.654.321");
        }
        deviceTree.put("customer", customerInfo);

        return ResponseEntity.ok(deviceTree);
    }
}
