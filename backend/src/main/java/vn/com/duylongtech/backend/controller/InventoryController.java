package vn.com.duylongtech.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.com.duylongtech.backend.service.InventoryService;

import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping("/{productId}/stock")
    public ResponseEntity<?> getStock(@PathVariable Long productId) {
        return ResponseEntity.ok(inventoryService.getStockSummary(productId));
    }

    @GetMapping("/{productId}/history")
    public ResponseEntity<?> getHistory(@PathVariable Long productId) {
        return ResponseEntity.ok(inventoryService.getHistory(productId));
    }

    @PostMapping("/receive")
    public ResponseEntity<?> receivePurchase(@RequestBody Map<String, Object> body) {
        inventoryService.receivePurchase(
                Long.valueOf(body.get("productId").toString()),
                Long.valueOf(body.get("warehouseId").toString()),
                Integer.parseInt(body.get("quantity").toString()),
                (String) body.get("performedBy"),
                (String) body.get("note")
        );
        return ResponseEntity.ok(Map.of("message", "Nhập kho thành công"));
    }

    @PostMapping("/reserve")
    public ResponseEntity<?> reserve(@RequestBody Map<String, Object> body) {
        try {
            inventoryService.reserveForOrder(
                    Long.valueOf(body.get("productId").toString()),
                    Long.valueOf(body.get("warehouseId").toString()),
                    (String) body.get("orderId"),
                    (String) body.get("performedBy")
            );
            return ResponseEntity.ok(Map.of("message", "Đã giữ hàng"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
