package vn.com.duylongtech.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.com.duylongtech.backend.entity.*;
import vn.com.duylongtech.backend.repository.*;

import java.time.LocalDate;
import java.util.*;

/**
 * Serial Number Controller — Quản lý vòng đời từng đơn vị sản phẩm
 * Đây là module trái tim của WMS ngành IT
 */
@RestController
@RequestMapping("/api/serials")
public class SerialController {

    private final ProductSerialRepository serialRepo;
    private final ProductRepository productRepo;
    private final BinLocationRepository binRepo;

    public SerialController(ProductSerialRepository serialRepo, ProductRepository productRepo,
                            BinLocationRepository binRepo) {
        this.serialRepo = serialRepo;
        this.productRepo = productRepo;
        this.binRepo = binRepo;
    }

    // ===== TRA CỨU SERIAL (QR SCAN) =====
    @GetMapping("/lookup/{sn}")
    public ResponseEntity<?> lookup(@PathVariable String sn) {
        return serialRepo.findBySerialNumber(sn)
            .map(ps -> ResponseEntity.ok(serialize(ps)))
            .orElse(ResponseEntity.notFound().build());
    }

    // ===== DANH SÁCH THEO SẢN PHẨM =====
    @GetMapping("/product/{productId}")
    public ResponseEntity<?> byProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(
            serialRepo.findByProductIdOrderByCreatedAtDesc(productId)
                      .stream().map(this::serialize).toList()
        );
    }

    // ===== DANH SÁCH THEO TRẠNG THÁI =====
    @GetMapping
    public ResponseEntity<?> getAll(@RequestParam(required = false) String status) {
        List<ProductSerial> list = (status != null)
            ? serialRepo.findByLifecycleStatus(status)
            : serialRepo.findAll();
        return ResponseEntity.ok(list.stream().map(this::serialize).toList());
    }

    // ===== NHẬP KHO: BẮN HÀNG LOẠT SERIAL (BULK SCAN) =====
    @PostMapping("/bulk-inbound")
    public ResponseEntity<?> bulkInbound(@RequestBody Map<String, Object> body) {
        try {
            Long productId = Long.valueOf(body.get("productId").toString());
            Product product = productRepo.findById(productId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));

            @SuppressWarnings("unchecked")
            List<String> serials = (List<String>) body.get("serialNumbers");
            String supplier = body.containsKey("supplier") ? body.get("supplier").toString() : null;
            String invoice  = body.containsKey("purchaseInvoice") ? body.get("purchaseInvoice").toString() : null;
            String addedBy  = body.containsKey("addedBy") ? body.get("addedBy").toString() : "admin";

            // Thời hạn bảo hành mặc định theo sản phẩm
            LocalDate warrantyStart = LocalDate.now();
            LocalDate warrantyEnd = warrantyStart.plusMonths(
                product.getWarrantyMonths() != null ? product.getWarrantyMonths() : 12
            );

            int created = 0;
            List<String> skipped = new ArrayList<>();

            for (String sn : serials) {
                sn = sn.trim();
                if (sn.isEmpty()) continue;
                if (serialRepo.findBySerialNumber(sn).isPresent()) {
                    skipped.add(sn);
                    continue;
                }
                ProductSerial ps = ProductSerial.builder()
                    .product(product)
                    .serialNumber(sn)
                    .supplier(supplier)
                    .purchaseInvoice(invoice)
                    .warrantyType(product.getWarrantyType() != null ? product.getWarrantyType() : "SHOP")
                    .warrantyStart(warrantyStart)
                    .warrantyEnd(warrantyEnd)
                    .lifecycleStatus("IN_STOCK")
                    .addedBy(addedBy)
                    .build();
                serialRepo.save(ps);
                created++;
            }

            // Cập nhật số lượng tồn kho của Product
            product.setQuantity((product.getQuantity() != null ? product.getQuantity() : 0) + created);
            productRepo.save(product);

            return ResponseEntity.ok(Map.of(
                "created", created,
                "skipped", skipped,
                "message", String.format("Đã nhập %d serial. Bỏ qua %d serial trùng.", created, skipped.size())
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ===== CẬP NHẬT TRẠNG THÁI SERIAL =====
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return serialRepo.findById(id).map(ps -> {
            ps.setLifecycleStatus(body.get("lifecycleStatus"));
            if (body.containsKey("techNote")) ps.setTechNote(body.get("techNote"));
            serialRepo.save(ps);
            return ResponseEntity.ok(Map.of("message", "Đã cập nhật trạng thái Serial " + ps.getSerialNumber()));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ===== THỐNG KÊ BẢO HÀNH HẾT HẠN =====
    @GetMapping("/expired-warranties")
    public ResponseEntity<?> expiredWarranties() {
        return ResponseEntity.ok(serialRepo.findExpiredWarranties().stream().map(this::serialize).toList());
    }

    private Map<String, Object> serialize(ProductSerial ps) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", ps.getId());
        m.put("serialNumber", ps.getSerialNumber());
        m.put("imei", ps.getImei());
        m.put("lifecycleStatus", ps.getLifecycleStatus());
        m.put("supplier", ps.getSupplier());
        m.put("purchaseInvoice", ps.getPurchaseInvoice());
        m.put("warrantyType", ps.getWarrantyType());
        m.put("warrantyStart", ps.getWarrantyStart());
        m.put("warrantyEnd", ps.getWarrantyEnd());
        m.put("techNote", ps.getTechNote());
        m.put("addedBy", ps.getAddedBy());
        m.put("soldAt", ps.getSoldAt());
        m.put("saleOrderCode", ps.getSaleOrderCode());
        m.put("createdAt", ps.getCreatedAt());
        if (ps.getProduct() != null) {
            m.put("productId", ps.getProduct().getId());
            m.put("productName", ps.getProduct().getName());
        }
        if (ps.getBinLocation() != null) {
            m.put("binCode", ps.getBinLocation().getBinCode());
            m.put("zoneName", ps.getBinLocation().getZoneName());
        }
        if (ps.getSoldToUser() != null) {
            m.put("soldToUser", ps.getSoldToUser().getFullName());
        }
        return m;
    }
}
