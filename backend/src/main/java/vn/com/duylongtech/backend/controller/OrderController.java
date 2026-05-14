package vn.com.duylongtech.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.com.duylongtech.backend.entity.Order;
import vn.com.duylongtech.backend.repository.OrderRepository;

import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderRepository orderRepository;
    private final vn.com.duylongtech.backend.service.EmailService emailService;

    public OrderController(OrderRepository orderRepository, vn.com.duylongtech.backend.service.EmailService emailService) {
        this.orderRepository = orderRepository;
        this.emailService = emailService;
    }

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody Order order) {
        Order savedOrder = orderRepository.save(order);
        
        // Gửi thông báo (Giả lập)
        if (order.getCustomer() != null) {
            emailService.sendOrderConfirmation("customer@example.com", savedOrder.getId().toString(), savedOrder.getTotalAmount().toString());
        }
        
        // Giả lập sinh thông tin thanh toán VietQR
        String qrUrl = "https://img.vietqr.io/image/vcb-0011004455667-compact2.png?amount=" 
                        + savedOrder.getTotalAmount() 
                        + "&addInfo=DH" + savedOrder.getId() 
                        + "&accountName=DUY%20LONG%20TECH";
                        
        return ResponseEntity.ok(Map.of(
            "order", savedOrder,
            "qrUrl", qrUrl,
            "message", "Đơn hàng đã được tạo thành công"
        ));
    }
}
