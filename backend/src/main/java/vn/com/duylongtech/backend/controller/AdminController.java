package vn.com.duylongtech.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.com.duylongtech.backend.entity.*;
import vn.com.duylongtech.backend.repository.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Admin Dashboard API — Quản trị toàn bộ hệ thống
 * Tất cả endpoint yêu cầu role=ADMIN (kiểm tra phía frontend + middleware)
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepo;
    private final ProductRepository productRepo;
    private final ShipperWalletRepository walletRepo;
    private final TransactionLogRepository txRepo;
    private final DeviceComponentRepository componentRepo;
    private final SiteSettingRepository settingRepo;
    private final StockMovementRepository stockRepo;
    private final WarehouseRepository warehouseRepo;

    public AdminController(UserRepository userRepo, ProductRepository productRepo,
                           ShipperWalletRepository walletRepo, TransactionLogRepository txRepo,
                           DeviceComponentRepository componentRepo, SiteSettingRepository settingRepo,
                           StockMovementRepository stockRepo, WarehouseRepository warehouseRepo) {
        this.userRepo = userRepo;
        this.productRepo = productRepo;
        this.walletRepo = walletRepo;
        this.txRepo = txRepo;
        this.componentRepo = componentRepo;
        this.settingRepo = settingRepo;
        this.stockRepo = stockRepo;
        this.warehouseRepo = warehouseRepo;
    }

    // ===== USER MANAGEMENT =====
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        List<Map<String, Object>> result = new ArrayList<>();
        for (User u : userRepo.findAll()) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", u.getId());
            m.put("username", u.getUsername());
            m.put("fullName", u.getFullName());
            m.put("email", u.getEmail());
            m.put("phone", u.getPhone());
            m.put("role", u.getRole());
            result.add(m);
        }
        return ResponseEntity.ok(result);
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> updateRole(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return userRepo.findById(id).map(u -> {
            u.setRole(body.get("role"));
            userRepo.save(u);
            return ResponseEntity.ok(Map.of("message", "Đã cập nhật role → " + body.get("role")));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ===== PRODUCT MANAGEMENT =====
    @PutMapping("/products/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return productRepo.findById(id).map(p -> {
            if (body.containsKey("basePrice")) p.setBasePrice(new BigDecimal(body.get("basePrice").toString()));
            if (body.containsKey("status")) p.setStatus((String) body.get("status"));
            if (body.containsKey("quantity")) p.setQuantity(Integer.parseInt(body.get("quantity").toString()));
            if (body.containsKey("warrantyMonths")) p.setWarrantyMonths(Integer.parseInt(body.get("warrantyMonths").toString()));
            productRepo.save(p);
            return ResponseEntity.ok(Map.of("message", "Đã cập nhật sản phẩm #" + id));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ===== SHIPPER WALLET MANAGEMENT =====
    @GetMapping("/wallets")
    public ResponseEntity<?> getAllWallets() {
        List<Map<String, Object>> result = new ArrayList<>();
        for (ShipperWallet w : walletRepo.findAll()) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", w.getId());
            m.put("shipperName", w.getUser().getFullName());
            m.put("shipperPhone", w.getUser().getPhone());
            m.put("balance", w.getBalance());
            m.put("totalCollected", w.getTotalCollected());
            m.put("totalSettled", w.getTotalSettled());
            m.put("deliveryCount", w.getDeliveryCount());
            m.put("lastDeliveryAt", w.getLastDeliveryAt());
            m.put("lastSettledAt", w.getLastSettledAt());
            result.add(m);
        }
        return ResponseEntity.ok(result);
    }

    /**
     * Admin thanh toán (settle) ví shipper → reset balance về 0
     */
    @PostMapping("/wallets/{walletId}/settle")
    public ResponseEntity<?> settleWallet(@PathVariable Long walletId, @RequestBody Map<String, String> body) {
        return walletRepo.findById(walletId).map(w -> {
            BigDecimal amount = w.getBalance();
            if (amount.compareTo(BigDecimal.ZERO) <= 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Ví không có số dư để thanh toán"));
            }
            // Ghi log phiếu chi
            txRepo.save(TransactionLog.builder()
                    .wallet(w)
                    .type("ADMIN_SETTLE")
                    .amount(amount.negate())
                    .balanceBefore(w.getBalance())
                    .balanceAfter(BigDecimal.ZERO)
                    .note(body.getOrDefault("note", "Thanh toán công nợ shipper"))
                    .performedBy(body.getOrDefault("adminUser", "admin"))
                    .build());

            w.setTotalSettled(w.getTotalSettled().add(amount));
            w.setBalance(BigDecimal.ZERO);
            w.setLastSettledAt(LocalDateTime.now());
            walletRepo.save(w);

            return ResponseEntity.ok(Map.of(
                "message", "Đã thanh toán " + amount + "₫ cho " + w.getUser().getFullName(),
                "settledAmount", amount
            ));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ===== DASHBOARD STATS =====
    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalUsers", userRepo.count());
        stats.put("totalProducts", productRepo.count());
        stats.put("availableProducts", productRepo.findAll().stream()
                .filter(p -> "AVAILABLE".equals(p.getStatus())).count());
        stats.put("totalShippers", userRepo.findAll().stream()
                .filter(u -> "SHIPPER".equals(u.getRole())).count());
        stats.put("pendingBalance", walletRepo.findAll().stream()
                .map(ShipperWallet::getBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        return ResponseEntity.ok(stats);
    }

    // ===== CRUD PRODUCT =====
    @PostMapping("/products")
    public ResponseEntity<?> createProduct(@RequestBody Product p) {
        if (p.getStatus() == null) p.setStatus("AVAILABLE");
        if (p.getWarrantyMonths() == null) p.setWarrantyMonths(12);
        return ResponseEntity.ok(productRepo.save(p));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        if (!productRepo.existsById(id)) return ResponseEntity.notFound().build();
        productRepo.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Đã xoá sản phẩm"));
    }

    // ===== CRUD COMPONENTS (Linh Kiện) =====
    @GetMapping("/components")
    public ResponseEntity<?> getComponents() {
        return ResponseEntity.ok(componentRepo.findAll());
    }

    @PostMapping("/components")
    public ResponseEntity<?> createComponent(@RequestBody DeviceComponent c) {
        return ResponseEntity.ok(componentRepo.save(c));
    }

    @PutMapping("/components/{id}")
    public ResponseEntity<?> updateComponent(@PathVariable Long id, @RequestBody DeviceComponent update) {
        return componentRepo.findById(id).map(c -> {
            c.setName(update.getName());
            c.setComponentType(update.getComponentType());
            c.setSerialNumber(update.getSerialNumber());
            c.setStatus(update.getStatus());
            return ResponseEntity.ok(componentRepo.save(c));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/components/{id}")
    public ResponseEntity<?> deleteComponent(@PathVariable Long id) {
        if (!componentRepo.existsById(id)) return ResponseEntity.notFound().build();
        componentRepo.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Đã xoá linh kiện"));
    }

    // ===== INVENTORY LOGIC (Nhập/Xuất Kho có lưu StockMovement) =====
    @PostMapping("/inventory/inbound")
    public ResponseEntity<?> inbound(@RequestBody Map<String, Object> payload) {
        try {
            boolean isNewProduct = (Boolean) payload.getOrDefault("isNewProduct", false);
            Product p;
            
            if (isNewProduct) {
                // Tạo mới sản phẩm hoàn toàn từ Map
                Map<String, Object> pMap = (Map<String, Object>) payload.get("product");
                p = new Product();
                p.setName((String) pMap.get("name"));
                p.setBrand((String) pMap.get("brand"));
                p.setCategory(null); // Tạm thời bỏ qua category
                p.setQuantity(0);
                p.setStatus("AVAILABLE");
                if (pMap.containsKey("warrantyMonths")) p.setWarrantyMonths(Integer.parseInt(pMap.get("warrantyMonths").toString()));
                if (pMap.containsKey("basePrice")) p.setBasePrice(new BigDecimal(pMap.get("basePrice").toString()));
                p = productRepo.save(p);
            } else {
                // Sản phẩm đã tồn tại
                Long pid = Long.valueOf(payload.get("productId").toString());
                p = productRepo.findById(pid).orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));
            }

            Warehouse w = warehouseRepo.findById(Long.valueOf(payload.getOrDefault("warehouseId", 1).toString()))
                                       .orElseThrow(() -> new RuntimeException("Không tìm thấy kho"));

            int qtyChange = Integer.parseInt(payload.get("quantityChange").toString());
            
            StockMovement sm = new StockMovement();
            sm.setProduct(p);
            sm.setWarehouse(w);
            sm.setQuantityChange(qtyChange);
            sm.setItemStatus("AVAILABLE");
            sm.setReason("PURCHASE");
            
            if (payload.containsKey("supplier")) sm.setSupplier((String) payload.get("supplier"));
            if (payload.containsKey("unitPrice")) sm.setUnitPrice(new BigDecimal(payload.get("unitPrice").toString()));
            if (payload.containsKey("unitOfMeasure")) sm.setUnitOfMeasure((String) payload.get("unitOfMeasure"));
            if (payload.containsKey("reason")) sm.setNote((String) payload.get("reason"));
            if (payload.containsKey("referenceId")) sm.setReferenceId((String) payload.get("referenceId"));
            
            sm.setMovementDate(LocalDateTime.now());
            stockRepo.save(sm);
            
            // Cập nhật Product Quantity & Giá Vốn (trung bình nếu cần, tạm thời chỉ lưu last costPrice)
            p.setQuantity(p.getQuantity() + qtyChange);
            if (payload.containsKey("unitPrice")) {
                p.setCostPrice(new BigDecimal(payload.get("unitPrice").toString()));
            }
            productRepo.save(p);
            
            return ResponseEntity.ok(Map.of("message", "Nhập kho chuẩn WMS thành công!", "product", p));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/inventory/outbound")
    public ResponseEntity<?> outbound(@RequestBody StockMovement sm) {
        sm.setItemStatus("SOLD");
        sm.setReason("SALE");
        // Xuất kho -> âm số lượng
        sm.setQuantityChange(-Math.abs(sm.getQuantityChange())); 
        sm.setMovementDate(LocalDateTime.now());
        stockRepo.save(sm);
        
        Product p = productRepo.findById(sm.getProduct().getId()).orElse(null);
        if (p != null) {
            p.setQuantity(Math.max(0, p.getQuantity() + sm.getQuantityChange()));
            productRepo.save(p);
        }
        return ResponseEntity.ok(Map.of("message", "Xuất kho thành công"));
    }

    // ===== UI SETTINGS (Banners, Headers, Footers) =====
    @GetMapping("/settings")
    public ResponseEntity<?> getSettings() {
        Map<String, String> result = new LinkedHashMap<>();
        for (SiteSetting s : settingRepo.findAll()) {
            result.put(s.getKey(), s.getValue());
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/settings")
    public ResponseEntity<?> saveSettings(@RequestBody Map<String, String> settings) {
        settings.forEach((k, v) -> {
            SiteSetting s = settingRepo.findById(k).orElse(new SiteSetting());
            s.setKey(k);
            s.setValue(v);
            settingRepo.save(s);
        });
        return ResponseEntity.ok(Map.of("message", "Cập nhật giao diện thành công"));
    }
}
