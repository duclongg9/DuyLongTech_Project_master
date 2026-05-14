package vn.com.duylongtech.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.com.duylongtech.backend.entity.*;
import vn.com.duylongtech.backend.repository.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * RMA Controller — Luồng tiếp nhận và xử lý bảo hành / đổi trả
 * Tiêu chuẩn: mọi thao tác đều có audit trail (ai làm, lúc nào)
 */
@RestController
@RequestMapping("/api/rma")
public class RmaController {

    private final RmaTicketRepository rmaRepo;
    private final ProductRepository productRepo;
    private final DeviceComponentRepository componentRepo;
    private final UserRepository userRepo;
    private final ProductSerialRepository serialRepo;

    public RmaController(RmaTicketRepository rmaRepo, ProductRepository productRepo,
                         DeviceComponentRepository componentRepo, UserRepository userRepo,
                         ProductSerialRepository serialRepo) {
        this.rmaRepo = rmaRepo;
        this.productRepo = productRepo;
        this.componentRepo = componentRepo;
        this.userRepo = userRepo;
        this.serialRepo = serialRepo;
    }

    // ===== LẤY DANH SÁCH =====
    @GetMapping
    public ResponseEntity<?> getAll(@RequestParam(required = false) String status) {
        List<RmaTicket> tickets = (status != null)
            ? rmaRepo.findByStatusOrderByReceivedAtDesc(status)
            : rmaRepo.findAllActive();
        return ResponseEntity.ok(serializeList(tickets));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOne(@PathVariable Long id) {
        return rmaRepo.findById(id)
            .map(t -> ResponseEntity.ok(serialize(t)))
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/serial/{serial}")
    public ResponseEntity<?> getBySerial(@PathVariable String serial) {
        return ResponseEntity.ok(rmaRepo.findBySerialNumber(serial).stream().map(this::serialize).toList());
    }

    @GetMapping("/pending-vendor")
    public ResponseEntity<?> getPendingVendor() {
        return ResponseEntity.ok(rmaRepo.findPendingVendorReturn().stream().map(this::serialize).toList());
    }

    // ===== TẠO PHIẾU RMA (TIẾP NHẬN) =====
    @PostMapping
    public ResponseEntity<?> createRma(@RequestBody Map<String, Object> body) {
        try {
            RmaTicket t = new RmaTicket();

            // Sinh mã RMA tự động: RMA-YYYYMM-XXXX
            String rmaCode = "RMA-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMM"))
                           + "-" + String.format("%04d", rmaRepo.count() + 1);
            t.setRmaCode(rmaCode);

            // Loại RMA
            t.setRmaType(getStr(body, "rmaType", "RMA_CUSTOMER"));
            t.setSerialNumber(getStr(body, "serialNumber", null));
            t.setFaultType(getStr(body, "faultType", "UNKNOWN"));
            t.setFaultDescription(getStr(body, "faultDescription", null));
            t.setPhysicalConditionNote(getStr(body, "physicalConditionNote", null));
            t.setEvidencePhotoUrls(getStr(body, "evidencePhotoUrls", null));
            t.setWarrantyDecision(getStr(body, "warrantyDecision", "WARRANTY_VALID"));
            t.setWarrantyExclusionReason(getStr(body, "warrantyExclusionReason", null));
            t.setVendorName(getStr(body, "vendorName", null));
            t.setReceivedBy(getStr(body, "receivedBy", "admin"));
            t.setStatus("RECEIVED");
            t.setReceivedAt(LocalDateTime.now());

            // Liên kết Product / Component
            if (body.containsKey("productId")) {
                productRepo.findById(Long.valueOf(body.get("productId").toString()))
                    .ifPresent(t::setProduct);
            }
            if (body.containsKey("componentId")) {
                componentRepo.findById(Long.valueOf(body.get("componentId").toString()))
                    .ifPresent(t::setComponent);
            }
            if (body.containsKey("customerId")) {
                userRepo.findById(Long.valueOf(body.get("customerId").toString()))
                    .ifPresent(t::setCustomer);
            }

            // Cập nhật trạng thái ProductSerial nếu có
            if (t.getSerialNumber() != null) {
                serialRepo.findBySerialNumber(t.getSerialNumber()).ifPresent(ps -> {
                    ps.setLifecycleStatus("UNDER_REPAIR");
                    serialRepo.save(ps);
                });
            }

            rmaRepo.save(t);
            return ResponseEntity.ok(Map.of("message", "Tạo phiếu RMA thành công!", "rmaCode", rmaCode));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ===== CẬP NHẬT TRẠNG THÁI RMA =====
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return rmaRepo.findById(id).map(t -> {
            String newStatus = body.get("status");
            t.setStatus(newStatus);

            if (body.containsKey("technicianNote")) t.setTechnicianNote(body.get("technicianNote"));
            if (body.containsKey("vendorTicketCode")) t.setVendorTicketCode(body.get("vendorTicketCode"));
            if (body.containsKey("vendorSentDate")) t.setVendorSentDate(LocalDate.parse(body.get("vendorSentDate")));
            if (body.containsKey("vendorExpectedReturnDate")) t.setVendorExpectedReturnDate(LocalDate.parse(body.get("vendorExpectedReturnDate")));
            if (body.containsKey("vendorActualReturnDate")) t.setVendorActualReturnDate(LocalDate.parse(body.get("vendorActualReturnDate")));

            // Khi đóng phiếu, tự cập nhật Serial về trạng thái phù hợp
            if ("RETURNED".equals(newStatus) || "CLOSED".equals(newStatus)) {
                if (t.getSerialNumber() != null) {
                    serialRepo.findBySerialNumber(t.getSerialNumber()).ifPresent(ps -> {
                        ps.setLifecycleStatus("SOLD"); // Trả lại cho khách
                        serialRepo.save(ps);
                    });
                }
                t.setClosedAt(LocalDateTime.now());
            }
            if ("SENT_TO_VENDOR".equals(newStatus)) {
                if (t.getSerialNumber() != null) {
                    serialRepo.findBySerialNumber(t.getSerialNumber()).ifPresent(ps -> {
                        ps.setLifecycleStatus("SENT_WARRANTY");
                        serialRepo.save(ps);
                    });
                }
            }

            rmaRepo.save(t);
            return ResponseEntity.ok(Map.of("message", "Đã cập nhật trạng thái RMA → " + newStatus));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ===== THỐNG KÊ =====
    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalActive", rmaRepo.findAllActive().size());
        stats.put("pendingVendor", rmaRepo.findPendingVendorReturn().size());
        stats.put("received", rmaRepo.findByStatusOrderByReceivedAtDesc("RECEIVED").size());
        stats.put("sentToVendor", rmaRepo.findByStatusOrderByReceivedAtDesc("SENT_TO_VENDOR").size());
        stats.put("repaired", rmaRepo.findByStatusOrderByReceivedAtDesc("REPAIRED").size());
        return ResponseEntity.ok(stats);
    }

    // ===== HELPERS =====
    private String getStr(Map<String, Object> body, String key, String defaultVal) {
        return body.containsKey(key) && body.get(key) != null ? body.get(key).toString() : defaultVal;
    }

    private Map<String, Object> serialize(RmaTicket t) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", t.getId());
        m.put("rmaCode", t.getRmaCode());
        m.put("rmaType", t.getRmaType());
        m.put("serialNumber", t.getSerialNumber());
        m.put("faultType", t.getFaultType());
        m.put("faultDescription", t.getFaultDescription());
        m.put("physicalConditionNote", t.getPhysicalConditionNote());
        m.put("evidencePhotoUrls", t.getEvidencePhotoUrls());
        m.put("warrantyDecision", t.getWarrantyDecision());
        m.put("warrantyExclusionReason", t.getWarrantyExclusionReason());
        m.put("status", t.getStatus());
        m.put("vendorName", t.getVendorName());
        m.put("vendorTicketCode", t.getVendorTicketCode());
        m.put("vendorSentDate", t.getVendorSentDate());
        m.put("vendorExpectedReturnDate", t.getVendorExpectedReturnDate());
        m.put("vendorActualReturnDate", t.getVendorActualReturnDate());
        m.put("receivedBy", t.getReceivedBy());
        m.put("technicianNote", t.getTechnicianNote());
        m.put("receivedAt", t.getReceivedAt());
        m.put("closedAt", t.getClosedAt());
        if (t.getProduct() != null) m.put("productName", t.getProduct().getName());
        if (t.getComponent() != null) m.put("componentName", t.getComponent().getName());
        if (t.getCustomer() != null) m.put("customerName", t.getCustomer().getFullName());
        return m;
    }

    private List<Map<String, Object>> serializeList(List<RmaTicket> list) {
        return list.stream().map(this::serialize).toList();
    }
}
