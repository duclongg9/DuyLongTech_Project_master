package vn.com.duylongtech.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import vn.com.duylongtech.backend.entity.*;
import vn.com.duylongtech.backend.repository.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/sos")
public class SosController {

    private final UserRepository userRepo;
    private final ProductRepository productRepo;
    private final SosTicketRepository sosRepo;
    private final SimpMessagingTemplate messagingTemplate;

    public SosController(UserRepository userRepo, ProductRepository productRepo, 
                         SosTicketRepository sosRepo, SimpMessagingTemplate messagingTemplate) {
        this.userRepo = userRepo;
        this.productRepo = productRepo;
        this.sosRepo = sosRepo;
        this.messagingTemplate = messagingTemplate;
    }

    @PostMapping("/request")
    public ResponseEntity<?> requestSos(@RequestBody Map<String, Object> payload) {
        Long userId = Long.parseLong(payload.get("userId").toString());
        Double lat = payload.get("lat") != null ? Double.parseDouble(payload.get("lat").toString()) : null;
        Double lng = payload.get("lng") != null ? Double.parseDouble(payload.get("lng").toString()) : null;
        String address = (String) payload.get("address");

        User user = userRepo.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Người dùng không tồn tại"));
        }

        // Kiểm tra Tech-Care Prime
        if (Boolean.TRUE.equals(user.getIsPrimeMember())) {
            if (user.getPrimeExpiry() != null && user.getPrimeExpiry().isBefore(LocalDateTime.now())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Gói Tech-Care Prime đã hết hạn."));
            }
        } else {
            return ResponseEntity.status(403).body(Map.of("error", "Bạn chưa đăng ký gói Tech-Care Prime."));
        }

        // Tìm thiết bị backup
        Product backupDevice = productRepo.findAll().stream()
                .filter(p -> Boolean.TRUE.equals(p.getIsBackupDevice()) && "AVAILABLE".equals(p.getStatus()))
                .findFirst().orElse(null);

        // Tạo Ticket
        SosTicket ticket = SosTicket.builder()
                .customer(user)
                .backupDevice(backupDevice)
                .status("PENDING")
                .latitude(lat)
                .longitude(lng)
                .address(address)
                .build();
        
        sosRepo.save(ticket);

        // Real-time Dispatch tới Shipper
        Map<String, Object> event = new LinkedHashMap<>();
        event.put("ticketId", ticket.getId());
        event.put("customerName", user.getFullName());
        event.put("phone", user.getPhone());
        event.put("lat", lat);
        event.put("lng", lng);
        event.put("address", address);
        event.put("backupDevice", backupDevice != null ? backupDevice.getName() : "Không có sẵn máy mượn tạm");
        
        messagingTemplate.convertAndSend("/topic/sos-dispatch", (Object) event);

        return ResponseEntity.ok(Map.of(
            "message", "Đã gửi yêu cầu SOS khẩn cấp! Shipper đang đến.",
            "ticketId", ticket.getId(),
            "backupDevice", backupDevice != null ? backupDevice.getName() : null
        ));
    }
}
