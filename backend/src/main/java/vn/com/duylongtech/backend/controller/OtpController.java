package vn.com.duylongtech.backend.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import lombok.extern.slf4j.Slf4j;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * OTP Controller — Gửi & xác thực mã OTP qua Email/SMS
 * OTP hết hạn sau 45 giây, resend sau 30 giây
 */
@RestController
@RequestMapping("/api/otp")
@Slf4j
public class OtpController {

    // key = phone hoặc email, value = OtpEntry
    private final Map<String, OtpEntry> otpStore = new ConcurrentHashMap<>();

    /**
     * Gửi OTP tới email và SĐT
     */
    @PostMapping("/send")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> request) {
        String phone = request.getOrDefault("phone", "").trim();
        String email = request.getOrDefault("email", "").trim();

        if (phone.isEmpty() && email.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Cần ít nhất email hoặc số điện thoại"));
        }

        String key = phone + "|" + email;

        // Check cooldown (30s)
        OtpEntry existing = otpStore.get(key);
        if (existing != null) {
            long elapsed = Instant.now().getEpochSecond() - existing.sentAt;
            if (elapsed < 30) {
                return ResponseEntity.status(429).body(Map.of(
                    "error", "Vui lòng chờ trước khi gửi lại",
                    "retryAfter", 30 - elapsed
                ));
            }
        }

        // Generate 6-digit OTP
        String otp = String.format("%06d", new Random().nextInt(1000000));
        long now = Instant.now().getEpochSecond();
        otpStore.put(key, new OtpEntry(otp, now, now + 45)); // expires in 45s

        // Simulate sending OTP (log to console)
        if (!phone.isEmpty()) {
            log.info("📱 SMS OTP gửi tới {}: [{}]", phone, otp);
        }
        if (!email.isEmpty()) {
            log.info("📧 EMAIL OTP gửi tới {}: [{}]", email, otp);
        }

        return ResponseEntity.ok(Map.of(
            "message", "Mã OTP đã được gửi",
            "expiresIn", 45,
            "resendAfter", 30
        ));
    }

    /**
     * Xác thực OTP
     */
    @PostMapping("/verify")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
        String phone = request.getOrDefault("phone", "").trim();
        String email = request.getOrDefault("email", "").trim();
        String code = request.getOrDefault("code", "").trim();

        String key = phone + "|" + email;
        OtpEntry entry = otpStore.get(key);

        if (entry == null) {
            return ResponseEntity.badRequest().body(Map.of("verified", false, "error", "Chưa gửi mã OTP. Vui lòng gửi lại."));
        }

        // Check expiry (45s)
        if (Instant.now().getEpochSecond() > entry.expiresAt) {
            otpStore.remove(key);
            return ResponseEntity.badRequest().body(Map.of("verified", false, "error", "Mã OTP đã hết hạn. Vui lòng gửi lại."));
        }

        if (!entry.code.equals(code)) {
            return ResponseEntity.badRequest().body(Map.of("verified", false, "error", "Mã OTP không chính xác."));
        }

        // OTP valid — remove from store
        otpStore.remove(key);
        log.info("✅ OTP verified for: {}", key);

        return ResponseEntity.ok(Map.of("verified", true, "message", "Xác thực thành công!"));
    }

    /**
     * Internal OTP storage
     */
    private static class OtpEntry {
        final String code;
        final long sentAt;
        final long expiresAt;

        OtpEntry(String code, long sentAt, long expiresAt) {
            this.code = code;
            this.sentAt = sentAt;
            this.expiresAt = expiresAt;
        }
    }
}
