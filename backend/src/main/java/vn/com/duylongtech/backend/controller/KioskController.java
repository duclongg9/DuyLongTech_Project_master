package vn.com.duylongtech.backend.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import vn.com.duylongtech.backend.entity.User;
import vn.com.duylongtech.backend.repository.UserRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Kiosk → Auto-create Account → WebSocket → Tablet POS (Real-time)
 */
@Controller
@RestController
@RequestMapping("/api/kiosk")
public class KioskController {

    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private final List<Map<String, Object>> kioskOrders = Collections.synchronizedList(new ArrayList<>());

    public KioskController(SimpMessagingTemplate messagingTemplate,
                           UserRepository userRepository,
                           PasswordEncoder passwordEncoder) {
        this.messagingTemplate = messagingTemplate;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/order")
    public ResponseEntity<?> createKioskOrder(@RequestBody Map<String, Object> order) {
        String orderId = "KSK-" + System.currentTimeMillis() % 100000;
        String phone = String.valueOf(order.getOrDefault("customerPhone", ""));
        String email = String.valueOf(order.getOrDefault("customerEmail", ""));
        String name = String.valueOf(order.getOrDefault("customerName", "Khách Kiosk"));

        order.put("orderId", orderId);
        order.put("status", "PENDING");
        order.put("createdAt", LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss dd/MM/yyyy")));
        order.put("source", "KIOSK");

        // ===== AUTO-CREATE CUSTOMER ACCOUNT =====
        // Kiểm tra xem SĐT đã có tài khoản chưa
        Optional<User> existingUser = userRepository.findByPhone(phone);
        String generatedPassword = null;
        String username;

        if (existingUser.isPresent()) {
            username = existingUser.get().getUsername();
            order.put("accountStatus", "EXISTING");
            order.put("accountMessage", "Tài khoản đã tồn tại");
        } else {
            // Tạo tài khoản mới từ SĐT
            generatedPassword = generatePassword();
            username = phone.replaceAll("[^0-9]", ""); // username = SĐT thuần số

            User newUser = User.builder()
                    .username(username)
                    .password(passwordEncoder.encode(generatedPassword))
                    .fullName(name)
                    .email(email.isEmpty() ? null : email)
                    .phone(phone)
                    .role("CUSTOMER")
                    .build();
            userRepository.save(newUser);

            order.put("accountStatus", "CREATED");
            order.put("accountMessage", "Tài khoản mới đã được tạo tự động");
        }

        order.put("accountUsername", username);
        order.put("accountPassword", generatedPassword); // null nếu đã có TK

        // Thêm thông tin bảo hành
        order.put("warrantyStartDate", LocalDate.now().toString());
        order.put("warrantyEndDate", LocalDate.now().plusMonths(12).toString());
        order.put("warrantyTerms", List.of(
            "Bảo hành phần cứng 12 tháng tại cửa hàng",
            "Không BH: vào nước, rơi vỡ, tháo máy bên ngoài",
            "Mang kèm phiếu này khi yêu cầu bảo hành",
            "Tra cứu bảo hành: duylongtech.com.vn/bao-hanh"
        ));

        kioskOrders.add(order);

        // Broadcast tới Tablet POS
        messagingTemplate.convertAndSend("/topic/kiosk-orders", (Object) order);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("message", "Đơn hàng đã gửi! Nhân viên sẽ xác nhận trong giây lát.");
        response.put("orderId", orderId);
        response.put("accountUsername", username);
        response.put("accountPassword", generatedPassword);
        response.put("accountStatus", order.get("accountStatus"));
        return ResponseEntity.ok(response);
    }

    @MessageMapping("/kiosk/order")
    @SendTo("/topic/kiosk-orders")
    public Map<String, Object> handleKioskOrderWs(Map<String, Object> order) {
        String orderId = "KSK-" + System.currentTimeMillis() % 100000;
        order.put("orderId", orderId);
        order.put("status", "PENDING");
        order.put("createdAt", LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss dd/MM/yyyy")));
        order.put("source", "KIOSK");
        kioskOrders.add(order);
        return order;
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getKioskOrders() {
        return ResponseEntity.ok(kioskOrders);
    }

    private String generatePassword() {
        // Sinh mật khẩu 6 ký tự dễ nhớ (cho khách)
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        StringBuilder sb = new StringBuilder();
        Random rnd = new Random();
        for (int i = 0; i < 6; i++) sb.append(chars.charAt(rnd.nextInt(chars.length())));
        return sb.toString();
    }
}
