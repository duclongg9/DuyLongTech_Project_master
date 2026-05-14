package vn.com.duylongtech.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.com.duylongtech.backend.entity.*;
import vn.com.duylongtech.backend.repository.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Shipper API — Ví công nợ, ghi nhận giao hàng, transaction log
 */
@RestController
@RequestMapping("/api/shipper")
public class ShipperController {

    private final UserRepository userRepo;
    private final ShipperWalletRepository walletRepo;
    private final TransactionLogRepository txRepo;

    public ShipperController(UserRepository userRepo,
                             ShipperWalletRepository walletRepo,
                             TransactionLogRepository txRepo) {
        this.userRepo = userRepo;
        this.walletRepo = walletRepo;
        this.txRepo = txRepo;
    }

    /**
     * Lấy thông tin ví theo userId
     */
    @GetMapping("/wallet/{userId}")
    public ResponseEntity<?> getWallet(@PathVariable Long userId) {
        return walletRepo.findByUserId(userId).map(w -> {
            Map<String, Object> r = new LinkedHashMap<>();
            r.put("id", w.getId());
            r.put("balance", w.getBalance());
            r.put("totalCollected", w.getTotalCollected());
            r.put("totalSettled", w.getTotalSettled());
            r.put("deliveryCount", w.getDeliveryCount());
            r.put("lastDeliveryAt", w.getLastDeliveryAt());
            r.put("lastSettledAt", w.getLastSettledAt());
            return ResponseEntity.ok(r);
        }).orElse(ResponseEntity.notFound().build());
    }

    /**
     * Ghi nhận giao hàng thành công → cộng tiền vào ví
     */
    @PostMapping("/delivery")
    public ResponseEntity<?> recordDelivery(@RequestBody Map<String, Object> body) {
        Long userId = Long.parseLong(body.get("userId").toString());
        BigDecimal amount = new BigDecimal(body.get("amount").toString());
        String orderId = (String) body.getOrDefault("orderId", "ORD-" + System.currentTimeMillis() % 100000);
        Double lat = body.get("latitude") != null ? Double.parseDouble(body.get("latitude").toString()) : null;
        Double lng = body.get("longitude") != null ? Double.parseDouble(body.get("longitude").toString()) : null;
        String proofUrl = (String) body.get("proofImageUrl");

        // Tìm hoặc tạo ví
        ShipperWallet wallet = walletRepo.findByUserId(userId).orElseGet(() -> {
            User user = userRepo.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
            return walletRepo.save(ShipperWallet.builder()
                    .user(user).balance(BigDecimal.ZERO)
                    .totalCollected(BigDecimal.ZERO).totalSettled(BigDecimal.ZERO)
                    .deliveryCount(0).build());
        });

        BigDecimal before = wallet.getBalance();

        // Cộng tiền
        wallet.setBalance(before.add(amount));
        wallet.setTotalCollected(wallet.getTotalCollected().add(amount));
        wallet.setDeliveryCount(wallet.getDeliveryCount() + 1);
        wallet.setLastDeliveryAt(LocalDateTime.now());
        walletRepo.save(wallet);

        // Log giao dịch
        txRepo.save(TransactionLog.builder()
                .wallet(wallet).type("DELIVERY_COLLECT").amount(amount)
                .balanceBefore(before).balanceAfter(wallet.getBalance())
                .orderId(orderId).latitude(lat).longitude(lng)
                .proofImageUrl(proofUrl)
                .note("Giao hàng thành công - Thu tiền ship")
                .performedBy("shipper-" + userId)
                .build());

        return ResponseEntity.ok(Map.of(
            "message", "Đã ghi nhận " + amount + "₫",
            "newBalance", wallet.getBalance(),
            "deliveryCount", wallet.getDeliveryCount()
        ));
    }

    /**
     * Lịch sử giao dịch
     */
    @GetMapping("/wallet/{userId}/transactions")
    public ResponseEntity<?> getTransactions(@PathVariable Long userId) {
        return walletRepo.findByUserId(userId).map(w -> {
            List<TransactionLog> logs = txRepo.findByWalletIdOrderByCreatedAtDesc(w.getId());
            List<Map<String, Object>> result = new ArrayList<>();
            for (TransactionLog t : logs) {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", t.getId());
                m.put("type", t.getType());
                m.put("amount", t.getAmount());
                m.put("balanceBefore", t.getBalanceBefore());
                m.put("balanceAfter", t.getBalanceAfter());
                m.put("orderId", t.getOrderId());
                m.put("note", t.getNote());
                m.put("proofImageUrl", t.getProofImageUrl());
                m.put("latitude", t.getLatitude());
                m.put("longitude", t.getLongitude());
                m.put("createdAt", t.getCreatedAt());
                result.add(m);
            }
            return ResponseEntity.ok(result);
        }).orElse(ResponseEntity.ok(Collections.emptyList()));
    }
}
