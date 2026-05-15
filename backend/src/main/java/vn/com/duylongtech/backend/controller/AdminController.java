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
    private final ProductOptionRepository optionRepo;
    public AdminController(UserRepository userRepo, ProductRepository productRepo,
                           ShipperWalletRepository walletRepo, TransactionLogRepository txRepo,
                           DeviceComponentRepository componentRepo, SiteSettingRepository settingRepo,
                           ProductOptionRepository optionRepo) {
        this.userRepo = userRepo;
        this.productRepo = productRepo;
        this.walletRepo = walletRepo;
        this.txRepo = txRepo;
        this.componentRepo = componentRepo;
        this.settingRepo = settingRepo;
        this.optionRepo = optionRepo;
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
            if (body.containsKey("name")) p.setName(body.get("name").toString());
            if (body.containsKey("brand")) p.setBrand(body.get("brand").toString());
            if (body.containsKey("model")) p.setModel(body.get("model").toString());
            if (body.containsKey("sku")) p.setSku(body.get("sku").toString());
            if (body.containsKey("condition")) p.setCondition(body.get("condition").toString());
            
            if (body.containsKey("basePrice")) p.setBasePrice(new BigDecimal(body.get("basePrice").toString()));
            if (body.containsKey("minPrice")) p.setMinPrice(new BigDecimal(body.get("minPrice").toString()));
            if (body.containsKey("inStock")) p.setInStock(Boolean.parseBoolean(body.get("inStock").toString()));
            
            if (body.containsKey("cpuModel")) p.setCpuModel(body.get("cpuModel").toString());
            if (body.containsKey("ramAmount")) p.setRamAmount(body.get("ramAmount").toString());
            if (body.containsKey("storageMain")) p.setStorageMain(body.get("storageMain").toString());
            if (body.containsKey("displaySize")) p.setDisplaySize(body.get("displaySize").toString());
            if (body.containsKey("displayRes")) p.setDisplayRes(body.get("displayRes").toString());
            if (body.containsKey("gpuName")) p.setGpuName(body.get("gpuName").toString());
            
            if (body.containsKey("imageUrl")) p.setImageUrl(body.get("imageUrl").toString());
            if (body.containsKey("description")) p.setDescription(body.get("description").toString());
            
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
                .filter(p -> Boolean.TRUE.equals(p.getInStock())).count());
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
        if (p.getInStock() == null) p.setInStock(true);
        return ResponseEntity.ok(productRepo.save(p));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        if (!productRepo.existsById(id)) return ResponseEntity.notFound().build();
        productRepo.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Đã xoá sản phẩm"));
    }

    // ===== CRUD PRODUCT OPTIONS =====
    @GetMapping("/products/{id}/options")
    public ResponseEntity<?> getProductOptions(@PathVariable Long id) {
        return productRepo.findById(id).map(p -> ResponseEntity.ok(p.getOptions()))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/products/{id}/options")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> saveProductOptions(@PathVariable Long id, @RequestBody List<ProductOption> options) {
        return productRepo.findById(id).map(p -> {
            optionRepo.deleteAll(p.getOptions());
            p.getOptions().clear();
            for (ProductOption opt : options) {
                opt.setProduct(p);
                p.getOptions().add(opt);
            }
            productRepo.save(p);
            return ResponseEntity.ok(Map.of("message", "Đã cập nhật tuỳ chọn cho sản phẩm #" + id));
        }).orElse(ResponseEntity.notFound().build());
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

    // INVENTORY REMOVED

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
