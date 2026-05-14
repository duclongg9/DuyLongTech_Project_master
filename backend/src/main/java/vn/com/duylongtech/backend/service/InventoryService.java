package vn.com.duylongtech.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.com.duylongtech.backend.entity.Product;
import vn.com.duylongtech.backend.entity.StockMovement;
import vn.com.duylongtech.backend.entity.Warehouse;
import vn.com.duylongtech.backend.repository.StockMovementRepository;
import vn.com.duylongtech.backend.repository.ProductRepository;
import vn.com.duylongtech.backend.repository.WarehouseRepository;

import java.util.List;
import java.util.Map;

@Service
public class InventoryService {

    private final StockMovementRepository movementRepo;
    private final ProductRepository productRepo;
    private final WarehouseRepository warehouseRepo;

    public InventoryService(StockMovementRepository movementRepo, ProductRepository productRepo, WarehouseRepository warehouseRepo) {
        this.movementRepo = movementRepo;
        this.productRepo = productRepo;
        this.warehouseRepo = warehouseRepo;
    }

    /**
     * Nhập hàng mới vào kho
     */
    @Transactional
    public StockMovement receivePurchase(Long productId, Long warehouseId, int qty, String performedBy, String note) {
        return movementRepo.save(StockMovement.builder()
                .product(productRepo.getReferenceById(productId))
                .warehouse(warehouseRepo.getReferenceById(warehouseId))
                .quantityChange(qty)
                .itemStatus("AVAILABLE")
                .reason("PURCHASE")
                .performedBy(performedBy)
                .note(note)
                .build());
    }

    /**
     * Giữ chỗ khi khách đặt hàng (chưa thanh toán)
     * Available -1, Reserved +1
     */
    @Transactional
    public void reserveForOrder(Long productId, Long warehouseId, String orderId, String performedBy) {
        int available = movementRepo.getStockByProductAndWarehouseAndStatus(productId, warehouseId, "AVAILABLE");
        if (available <= 0) throw new RuntimeException("Hết hàng! Không thể giữ chỗ.");

        Product p = productRepo.getReferenceById(productId);
        Warehouse w = warehouseRepo.getReferenceById(warehouseId);

        // Trừ AVAILABLE
        movementRepo.save(StockMovement.builder()
                .product(p).warehouse(w).quantityChange(-1)
                .itemStatus("AVAILABLE").reason("RESERVE")
                .referenceId(orderId).performedBy(performedBy).build());

        // Cộng RESERVED
        movementRepo.save(StockMovement.builder()
                .product(p).warehouse(w).quantityChange(1)
                .itemStatus("RESERVED").reason("RESERVE")
                .referenceId(orderId).performedBy(performedBy).build());
    }

    /**
     * Xác nhận bán (sau khi thanh toán)
     * Reserved -1, Sold +1
     */
    @Transactional
    public void confirmSale(Long productId, Long warehouseId, String orderId, String performedBy) {
        Product p = productRepo.getReferenceById(productId);
        Warehouse w = warehouseRepo.getReferenceById(warehouseId);

        movementRepo.save(StockMovement.builder()
                .product(p).warehouse(w).quantityChange(-1)
                .itemStatus("RESERVED").reason("SALE")
                .referenceId(orderId).performedBy(performedBy).build());

        movementRepo.save(StockMovement.builder()
                .product(p).warehouse(w).quantityChange(1)
                .itemStatus("SOLD").reason("SALE")
                .referenceId(orderId).performedBy(performedBy).build());
    }

    /**
     * Hủy giữ chỗ (khách không thanh toán)
     * Reserved -1, Available +1
     */
    @Transactional
    public void unreserve(Long productId, Long warehouseId, String orderId, String performedBy) {
        Product p = productRepo.getReferenceById(productId);
        Warehouse w = warehouseRepo.getReferenceById(warehouseId);

        movementRepo.save(StockMovement.builder()
                .product(p).warehouse(w).quantityChange(-1)
                .itemStatus("RESERVED").reason("UNRESERVE")
                .referenceId(orderId).performedBy(performedBy).build());

        movementRepo.save(StockMovement.builder()
                .product(p).warehouse(w).quantityChange(1)
                .itemStatus("AVAILABLE").reason("UNRESERVE")
                .referenceId(orderId).performedBy(performedBy).build());
    }

    /**
     * Nhận máy bảo hành từ khách
     * -> WARRANTY_HOLD +1
     */
    @Transactional
    public void receiveWarranty(Long productId, Long warehouseId, String ticketId, String performedBy, String note) {
        movementRepo.save(StockMovement.builder()
                .product(productRepo.getReferenceById(productId))
                .warehouse(warehouseRepo.getReferenceById(warehouseId))
                .quantityChange(1)
                .itemStatus("WARRANTY_HOLD")
                .reason("WARRANTY_IN")
                .referenceId(ticketId).performedBy(performedBy).note(note).build());
    }

    /**
     * Trả máy bảo hành cho khách
     * WARRANTY_HOLD -1
     */
    @Transactional
    public void releaseWarranty(Long productId, Long warehouseId, String ticketId, String performedBy) {
        movementRepo.save(StockMovement.builder()
                .product(productRepo.getReferenceById(productId))
                .warehouse(warehouseRepo.getReferenceById(warehouseId))
                .quantityChange(-1)
                .itemStatus("WARRANTY_HOLD")
                .reason("WARRANTY_OUT")
                .referenceId(ticketId).performedBy(performedBy).build());
    }

    /**
     * Đánh dấu máy hỏng (từ WARRANTY_HOLD -> DAMAGED)
     */
    @Transactional
    public void markDamaged(Long productId, Long warehouseId, String ticketId, String performedBy, String note) {
        Product p = productRepo.getReferenceById(productId);
        Warehouse w = warehouseRepo.getReferenceById(warehouseId);

        movementRepo.save(StockMovement.builder()
                .product(p).warehouse(w).quantityChange(-1)
                .itemStatus("WARRANTY_HOLD").reason("DAMAGE")
                .referenceId(ticketId).performedBy(performedBy).note(note).build());

        movementRepo.save(StockMovement.builder()
                .product(p).warehouse(w).quantityChange(1)
                .itemStatus("DAMAGED").reason("DAMAGE")
                .referenceId(ticketId).performedBy(performedBy).note(note).build());
    }

    // === QUERY ===

    public int getAvailableStock(Long productId) {
        return movementRepo.getTotalStockByProductAndStatus(productId, "AVAILABLE");
    }

    public Map<String, Integer> getStockSummary(Long productId) {
        return Map.of(
            "available", movementRepo.getTotalStockByProductAndStatus(productId, "AVAILABLE"),
            "reserved", movementRepo.getTotalStockByProductAndStatus(productId, "RESERVED"),
            "warrantyHold", movementRepo.getTotalStockByProductAndStatus(productId, "WARRANTY_HOLD"),
            "damaged", movementRepo.getTotalStockByProductAndStatus(productId, "DAMAGED"),
            "sold", movementRepo.getTotalStockByProductAndStatus(productId, "SOLD")
        );
    }

    public List<StockMovement> getHistory(Long productId) {
        return movementRepo.findByProductIdOrderByMovementDateDesc(productId);
    }
}
