package vn.com.duylongtech.backend.service;

import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class EmailService {

    public void sendOrderConfirmation(String to, String orderId, String amount) {
        // Giả lập gửi email thực tế
        String content = String.format(
            "CHÀO MỪNG ĐẾN VỚI DUY LONG TECH\n" +
            "Đơn hàng #%s của bạn đã được tiếp nhận.\n" +
            "Tổng thanh toán: %sđ\n" +
            "Cảm ơn bạn đã tin tưởng chúng tôi!", 
            orderId, amount
        );
        
        log.info("📧 EMAIL SENT TO: {}", to);
        log.info("Content:\n{}", content);
        
        // Trong thực tế sẽ dùng JavaMailSender:
        // javaMailSender.send(message);
    }
}
